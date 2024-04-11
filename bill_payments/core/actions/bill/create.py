from dataclasses import dataclass
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from sendr_utils import alist

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.notify_user_new_bill import NotifyUserNewBillAction
from pay.bill_payments.bill_payments.interactions.kazna.entities import DepartmentType, SinglePayerDoc
from pay.bill_payments.bill_payments.storage.entities.bill import Bill
from pay.bill_payments.bill_payments.storage.entities.enums import BillStatus
from pay.bill_payments.bill_payments.storage.entities.user import User
from pay.bill_payments.bill_payments.utils.stats import bill_notification_failures


@dataclass
class BillNotification:
    supplier_bill_id: str
    subscription_id: str
    payer_doc: SinglePayerDoc
    dep_type: DepartmentType
    bill_date: datetime
    purpose: str
    kbk: str
    payee_name: str
    amount: int
    payer_name: Optional[str] = None
    amount_to_pay: Optional[int] = None
    discount_size: Optional[str] = None
    discount_date: Optional[date] = None


class CreateBillsFromManyNotificationsAction(BaseDBAction):
    transact = True

    def __init__(self, notifications: List[BillNotification]):
        super().__init__()
        self.notifications = notifications

    async def handle(self) -> None:
        for notification in self.notifications:
            await CreateBillFromNotificationAction(
                supplier_bill_id=notification.supplier_bill_id,
                subscription_id=notification.subscription_id,
                payer_doc=notification.payer_doc,
                dep_type=notification.dep_type,
                bill_date=notification.bill_date,
                purpose=notification.purpose,
                kbk=notification.kbk,
                payee_name=notification.payee_name,
                amount=notification.amount,
                payer_name=notification.payer_name,
                amount_to_pay=notification.amount_to_pay,
                discount_size=notification.discount_size,
                discount_date=notification.discount_date,
            ).run()


class CreateBillFromNotificationAction(BaseDBAction):
    transact = True

    def __init__(
        self,
        supplier_bill_id: str,
        subscription_id: str,
        payer_doc: SinglePayerDoc,
        dep_type: DepartmentType,
        bill_date: datetime,
        purpose: str,
        kbk: str,
        payee_name: str,
        amount: int,
        payer_name: Optional[str] = None,
        amount_to_pay: Optional[int] = None,
        discount_size: Optional[str] = None,
        discount_date: Optional[date] = None,
    ):
        super().__init__()
        self.supplier_bill_id = supplier_bill_id
        self.subscription_id = subscription_id
        self.payer_doc = payer_doc
        self.dep_type = dep_type
        self.bill_date = bill_date
        self.purpose = purpose
        self.kbk = kbk
        self.payee_name = payee_name
        self.amount = amount
        self.payer_name = payer_name
        self.amount_to_pay = amount_to_pay
        self.discount_size = discount_size
        self.discount_date = discount_date

    async def _get_uid(self) -> Optional[int]:
        try:
            user = await self.storage.user.find_ensure_one(filters={'subscription_id': self.subscription_id})
            return user.uid
        except User.DoesNotExist:
            bill_notification_failures.inc()
            self.logger.error('A subscription was not found')
            return None

    async def _get_matched_document_id(self, uid: int) -> Optional[UUID]:
        documents = await alist(
            self.storage.document.find(filters={'uid': uid, 'code': self.payer_doc.code, 'value': self.payer_doc.value})
        )
        if len(documents) > 0:
            return documents[0].document_id

        bill_notification_failures.inc()
        self.logger.error('Document was not found for a new bill')
        return None

    async def _create_new_bill(self, uid: int) -> Optional[Bill]:
        document_id = await self._get_matched_document_id(uid)
        if not document_id:
            return None
        if not self.amount_to_pay:
            self.amount_to_pay = self.amount
        bill = await self.storage.bill.create(
            Bill(
                uid=uid,
                supplier_bill_id=self.supplier_bill_id,
                document_id=document_id,
                status=BillStatus.NEW,
                amount=self.amount,
                amount_to_pay=self.amount_to_pay,
                bill_date=self.bill_date,
                dep_type=self.dep_type,
                purpose=self.purpose,
                kbk=self.kbk,
                payee_name=self.payee_name,
                payer_name=self.payer_name,
                discount_size=self.discount_size,
                discount_date=self.discount_date,
            )
        )
        self.logger.info('A new bill created for an user')
        return bill

    async def handle(self) -> None:
        self.logger.context_push(
            supplier_billd_id=self.supplier_bill_id,
            subscription_id=self.subscription_id,
        )
        uid = await self._get_uid()
        if not uid:
            return

        self.logger.context_push(
            uid=uid,
        )
        try:
            await self.storage.bill.find_ensure_one(filters={'uid': uid, 'supplier_bill_id': self.supplier_bill_id})
        except Bill.DoesNotExist:
            if bill := await self._create_new_bill(uid):
                await NotifyUserNewBillAction(bill_id=str(bill.bill_id)).run_async()
