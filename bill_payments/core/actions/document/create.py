from typing import Optional
from uuid import uuid4

from sendr_auth.entities import User

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.bill.search import SearchFinesAction
from pay.bill_payments.bill_payments.core.actions.user.ensure import EnsureUserAction
from pay.bill_payments.bill_payments.core.exceptions import TooManyDocumentsError
from pay.bill_payments.bill_payments.interactions.kazna.entities import DocumentCode
from pay.bill_payments.bill_payments.storage.entities.document import Document


class CreateDocumentAction(BaseDBAction):
    transact = True

    def __init__(
        self,
        user: User,
        code: DocumentCode,
        value: str,
        title: Optional[str] = None,
    ):
        super().__init__()
        self.user = user
        self.code = code
        self.value = value
        self.title = title

    async def handle(self) -> Document:
        self.logger.context_push(code=self.code, title=self.title)
        self.logger.context_push(api_documents_limit=settings.API_DOCUMENTS_LIMIT)
        await EnsureUserAction(uid=self.user.uid).run()

        documents = await self.storage.document.find_by_uid(uid=self.user.uid)
        if len(documents) >= settings.API_DOCUMENTS_LIMIT:
            raise TooManyDocumentsError(limit=settings.API_DOCUMENTS_LIMIT)

        document = Document(
            document_id=uuid4(),
            uid=self.user.uid,
            code=self.code,
            value=self.value,
            title=self.title,
        )
        self.logger.context_push(document_id=document.document_id, is_new=True)

        document = await self.storage.document.create(document)
        revision = await SearchFinesAction.schedule(self.storage, self.user.uid)
        self.logger.context_push(revision=revision)
        self.logger.info('Document created')

        return document
