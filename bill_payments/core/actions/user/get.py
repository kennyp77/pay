from enum import Enum, unique

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.storage.entities.user import User


@unique
class UserState(Enum):
    UNREGISTERED = 'unregistered'
    SYNCING = 'syncing'
    COMPLETED = 'completed'


class GetUserStateAction(BaseDBAction):
    def __init__(self, uid: int):
        super().__init__()
        self.uid = uid

    async def handle(self) -> UserState:
        try:
            user = await self.storage.user.get(self.uid)
            if user.synced_revision == user.revision:
                return UserState.COMPLETED
            return UserState.SYNCING
        except User.DoesNotExist:
            return UserState.UNREGISTERED
