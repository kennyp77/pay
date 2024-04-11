from uuid import UUID

from sendr_auth.entities import User

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.bill.search import SearchFinesAction
from pay.bill_payments.bill_payments.storage.entities.document import Document


class DeleteDocumentAction(BaseDBAction):
    transact = True

    def __init__(self, user: User, document_id: UUID):
        super().__init__()
        self.user = user
        self.document_id = document_id

    async def handle(self) -> None:
        self.logger.context_push(document_id=self.document_id)
        try:
            document = await self.storage.document.get_by_uid_and_document_id(
                uid=self.user.uid,
                document_id=self.document_id,
            )
        except Document.DoesNotExist:
            self.logger.info('Document already deleted')
            return
        await self.storage.document.delete(document)
        revision = await SearchFinesAction.schedule(self.storage, self.user.uid, sync_subscription=True)
        self.logger.context_push(revision=revision)
        self.logger.info('Document deleted')
