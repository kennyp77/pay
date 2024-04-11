from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.bill.search import SearchFinesAction
from pay.bill_payments.bill_payments.core.exceptions import UserNotFoundError
from pay.bill_payments.bill_payments.storage.entities.user import User


class ForceSearchBillsAction(BaseDBAction):
    transact = True

    def __init__(self, uid: int):
        super().__init__()
        self.uid = uid

    async def handle(self) -> None:
        self.logger.info('Start force bill search')
        try:
            user = await self.storage.user.get(self.uid)
        except User.DoesNotExist:
            raise UserNotFoundError

        self.logger.context_push(
            synced_revision=user.synced_revision, revision=user.revision, syncing_revision=user.syncing_revision
        )

        if user.synced_revision != user.revision:
            self.logger.info('Sync already in progress')
            return

        new_revision = await SearchFinesAction.schedule(self.storage, uid=user.uid)
        self.logger.context_push(new_revision=new_revision)
        self.logger.info('Sync scheduled')
