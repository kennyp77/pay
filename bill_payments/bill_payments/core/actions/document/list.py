from typing import List

from sendr_auth.entities import User

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.storage.entities.document import Document


class ListDocumentsOfUserAction(BaseDBAction):
    allow_replica_read = True

    def __init__(self, user: User):
        super().__init__()
        self.user = user

    async def handle(self) -> List[Document]:
        return await self.storage.document.find_by_uid(uid=self.user.uid)
