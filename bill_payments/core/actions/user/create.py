from uuid import uuid4

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.exceptions import UserAlreadyExistsError
from pay.bill_payments.bill_payments.storage.entities.user import User


class CreateUserAction(BaseDBAction):
    transact = True

    def __init__(self, uid: int):
        super().__init__()
        self.uid = uid

    async def handle(self) -> User:
        user = User(uid=self.uid, subscription_id=str(uuid4()))
        try:
            user = await self.storage.user.create(user)
        except User.AlreadyExists:
            raise UserAlreadyExistsError
        self.logger.info('User created')
        return user
