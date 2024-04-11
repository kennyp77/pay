from typing import List
from uuid import UUID

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.exceptions import BillNotFoundError
from pay.bill_payments.bill_payments.storage.entities.bill import Bill
from pay.bill_payments.bill_payments.storage.entities.bill_order import BillOrder
from pay.bill_payments.bill_payments.storage.entities.enums import OrderStatus
from pay.bill_payments.bill_payments.storage.entities.order import Order


class CreateOrderAction(BaseDBAction):
    transact = True

    def __init__(self, uid: int, bill_ids: List[UUID]):
        super().__init__()
        self.uid = uid
        self.bill_ids = bill_ids

    async def handle(self) -> Order:
        self.logger.context_push(bill_ids=self.bill_ids)
        order = Order(
            uid=self.uid,
            status=OrderStatus.NEW,
        )
        order = await self.storage.order.create(order)
        self.logger.context_push(order_id=order.order_id)

        for bill_id in self.bill_ids:
            try:
                bill = await self.storage.bill.get(bill_id)
            except Bill.DoesNotExist:
                raise BillNotFoundError(bill_id=bill_id)
            if bill.uid != order.uid:
                self.logger.context_push(foreign_bill_id=bill.bill_id, foreign_uid=bill.uid)
                self.logger.warning('Order has foreign bill.')
                raise BillNotFoundError(bill_id=bill_id)

            assert bill.bill_id is not None
            await self.storage.bill_order.create(BillOrder(bill.bill_id, order.order_id))

        self.logger.info('Order created.')
        return order
