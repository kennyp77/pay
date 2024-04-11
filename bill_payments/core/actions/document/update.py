from dataclasses import replace
from typing import Optional
from uuid import UUID

from sendr_auth.entities import User

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.bill.search import SearchFinesAction
from pay.bill_payments.bill_payments.core.exceptions import DocumentNotFoundError
from pay.bill_payments.bill_payments.interactions.kazna.entities import DocumentCode
from pay.bill_payments.bill_payments.storage.entities.document import Document


class UpdateDocumentAction(BaseDBAction):
    transact = True

    def __init__(
        self,
        user: User,
        code: DocumentCode,
        value: str,
        document_id: UUID,
        title: Optional[str] = None,
    ):
        super().__init__()
        self.user = user
        self.document_id = document_id
        self.code = code
        self.value = value
        self.title = title

    async def handle(self) -> Document:
        self.logger.context_push(document_id=self.document_id, code=self.code, title=self.title)

        try:
            document = await self.storage.document.get_by_uid_and_document_id(
                uid=self.user.uid, document_id=self.document_id
            )
        except Document.DoesNotExist:
            raise DocumentNotFoundError

        self.logger.context_push(
            old_document=dict(
                code=self.code,
                title=self.title,
                value='SAME' if self.value == document.value else 'DIFFERS',
            ),
        )
        document = replace(
            document,
            code=self.code,
            value=self.value,
            title=self.title,
        )

        document = await self.storage.document.save(document)
        revision = await SearchFinesAction.schedule(self.storage, self.user.uid, sync_subscription=True)
        self.logger.context_push(revision=revision)
        self.logger.info('Document updated')

        return document
