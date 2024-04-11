from collections import defaultdict
from datetime import timedelta
from typing import Dict, List, Optional
from uuid import UUID

from sendr_utils import utcnow

from pay.bill_payments.bill_payments.core.actions.base import BaseAsyncDBAction
from pay.bill_payments.bill_payments.core.entities.bill import Bill, charge_to_bill
from pay.bill_payments.bill_payments.core.exceptions import DocumentNotFoundError, UserNotFoundError
from pay.bill_payments.bill_payments.interactions.kazna import SearchRequest
from pay.bill_payments.bill_payments.interactions.kazna.entities import (
    Charge,
    DepartmentType,
    DocumentCode,
    PayerDoc,
    SearchStatus,
)
from pay.bill_payments.bill_payments.storage import Storage
from pay.bill_payments.bill_payments.storage.entities.document import Document
from pay.bill_payments.bill_payments.storage.entities.enums import BillStatus, TaskType
from pay.bill_payments.bill_payments.storage.entities.user import User


class SearchFinesAction(BaseAsyncDBAction):
    task_type = TaskType.RUN_ACTION
    action_name = 'search_fines'

    def __init__(self, uid: int, revision: int, sync_subscription: bool = False):
        super().__init__()
        self.uid = uid
        self.revision = revision
        self.sync_subscription = sync_subscription
        self.documents: List[Document] = []

    @classmethod
    async def schedule(cls, storage: Storage, uid: int, sync_subscription: bool = False) -> int:
        revision = await storage.user.increment_revision(uid)
        await cls(uid=uid, revision=revision, sync_subscription=sync_subscription).run_async()
        return revision

    async def _get_payer_docs(self) -> List[PayerDoc]:
        code_to_values = defaultdict(list)
        for doc in self.documents:
            code_to_values[doc.code].append(doc.value)
        return [PayerDoc(code=k, value=v) for k, v in code_to_values.items()]

    def _find_document(self, charge: Charge) -> Document:
        for doc in self.documents:
            if doc.code == charge.document.code and doc.value in charge.document.value:
                return doc
        raise DocumentNotFoundError

    def _charge_to_bill(self, charge: Charge, bill_id: Optional[UUID] = None) -> Bill:
        document = self._find_document(charge)
        return charge_to_bill(uid=self.uid, charge=charge, document_id=document.document_id, bill_id=bill_id)

    async def _update_existing_bill(self, bill: Bill, charge: Optional[Charge]) -> None:
        self.logger.context_push(bill_id=bill.supplier_bill_id)
        if charge is None:
            if bill.status == BillStatus.NEW:
                bill.status = BillStatus.GONE
                await self.storage.bill.save(bill)
                self.logger.info('Bill is gone')
            return

        updated_bill = self._charge_to_bill(charge, bill_id=bill.bill_id)
        if bill.status == BillStatus.PAID:
            # something suspicious, logging entire object to investigate the situation
            self.logger.context_push(updated_bill=updated_bill)
            self.logger.warning('Received already paid fine')
        else:
            updated_bill.created = bill.created
            updated_bill.updated = bill.updated
            if bill != updated_bill:
                await self.storage.bill.save(updated_bill)
                self.logger.info('Bill updated')

    async def _save_charges(self, charges: List[Charge]) -> None:
        id2charges: Dict[str, Charge] = dict((el.supplier_bill_id, el) for el in charges)

        for bill in await self.storage.bill.find_by_uid(self.uid, for_update=True):
            with self.logger:
                await self._update_existing_bill(bill, id2charges.get(bill.supplier_bill_id))

            id2charges.pop(bill.supplier_bill_id, None)

        for new_charge in id2charges.values():
            await self.storage.bill.create(self._charge_to_bill(new_charge))
            with self.logger:
                self.logger.context_push(bill_id=new_charge.supplier_bill_id)
                self.logger.info('New bill received')

    def _document_is_present(self, code: DocumentCode, value: str) -> bool:
        for doc in self.documents:
            if doc.code == code and doc.value == value:
                return True
        return False

    async def _unsubscribe_if_needed(self, subscription_id: str) -> None:
        to_delete: List[PayerDoc] = []
        for doc in await self.clients.kazna.get_subscription(subscription_id):
            for val in doc.value:
                if not self._document_is_present(doc.code, val):
                    to_delete.append(PayerDoc(code=doc.code, value=[val]))

        self.logger.context_push(deleted_document_count=len(to_delete))
        if to_delete:
            await self.clients.kazna.unsubscribe(subscription_id=subscription_id, documents=to_delete)
            self.logger.info('Unsubscribed')

    async def _retry(self) -> None:
        # можно было бы просто кинуть исключение,
        # но тут нас не совсем устраивает экспоненциальный backoff,
        # который нужен, когда таска падает по причине "что-то разломалось"
        await SearchFinesAction(
            uid=self.uid,
            revision=self.revision,
        ).run_async(run_at=utcnow() + timedelta(seconds=1))

    async def _acquire_user(self) -> Optional[User]:
        try:
            user = await self.storage.user.get(self.uid, for_update=True)
        except User.DoesNotExist:
            raise UserNotFoundError

        self.logger.context_push(user_revision=user.revision, syncing_revision=user.syncing_revision)
        if self.revision != user.revision:
            # cleanup
            if user.syncing_revision == self.revision:
                user.syncing_revision = None
                await self.storage.user.save(user)
            self.logger.info('Obsolete task')
            return None

        # previous task is running, wait till it finishes
        if user.syncing_revision is not None and user.syncing_revision != self.revision:
            await self._retry()
            self.logger.info('Waiting previous task')
            return None

        user.syncing_revision = self.revision
        await self.storage.user.save(user)
        self.logger.info('User acquired')
        return user

    async def _complete(self, charges: List[Charge]) -> None:
        async with self.storage_setter(transact=True, reuse_connection=True):
            await self._save_charges(charges)
            await self.storage.user.update_synced_revision(uid=self.uid, revision=self.revision)
        self.logger.info('Search completed')

    async def handle(self) -> None:
        """
        Добиваемся инварианта: в один момент времени может выполняться только один вызов KaznaApi для uid,
        при этом у этой таски `revision` == `user.syncing_revision`.
        При вызове экшна снаружи нужно обеспечить, что не будет создано 2х тасок с одинаковым `revision`.
        """
        self.logger.context_push(revision=self.revision, uid=self.uid)

        async with self.storage_setter(transact=True, reuse_connection=True):
            if (user := await self._acquire_user()) is None:
                return

        self.documents = await self.storage.document.find_by_uid(self.uid)
        self.logger.context_push(document_count=len(self.documents))

        if self.sync_subscription and user.subscription_id:
            await self._unsubscribe_if_needed(user.subscription_id)

        if not self.documents:
            return await self._complete([])

        result = await self.clients.kazna.search(
            SearchRequest(
                documents=await self._get_payer_docs(),
                department=DepartmentType.GIBDD,
                subscribe=user.subscription_id,
            )
        )

        self.logger.context_push(
            search_response={'status': result.status.value, 'bill_ids': [x.supplier_bill_id for x in result.charges]}
        )
        self.logger.info('Got search response')

        if result.status == SearchStatus.COMPLETE:
            await self._complete(result.charges)
        else:
            await self._retry()
