from dataclasses import dataclass
from typing import List

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.user.get import GetUserStateAction, UserState
from pay.bill_payments.bill_payments.storage.entities.bill import Bill


@dataclass
class BillsState:
    state: UserState
    bills: List[Bill]


class GetBillsStateAction(BaseDBAction):
    def __init__(self, uid: int):
        super().__init__()
        self.uid = uid

    async def handle(self) -> BillsState:
        state = await GetUserStateAction(uid=self.uid).run()
        bills = await self.storage.bill.find_latest_unpaid_by_uid(uid=self.uid, limit=200)
        return BillsState(state=state, bills=bills)
