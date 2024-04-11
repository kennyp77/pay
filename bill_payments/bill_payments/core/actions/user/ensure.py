from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.user.create import CreateUserAction
from pay.bill_payments.bill_payments.core.exceptions import UserAlreadyExistsError
from pay.bill_payments.bill_payments.storage.entities.user import User


class EnsureUserAction(BaseDBAction):
    transact = True

    def __init__(self, uid: int):
        super().__init__()
        self.uid = uid

    async def handle(self) -> User:
        try:
            return await CreateUserAction(uid=self.uid).run()
        except UserAlreadyExistsError:
            return await self.storage.user.get(self.uid)
