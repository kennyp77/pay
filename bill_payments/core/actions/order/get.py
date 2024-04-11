from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.exceptions import OrderNotFoundError
from pay.bill_payments.bill_payments.storage.entities.order import Order


class GetOrderAction(BaseDBAction):
    allow_replica_read = True

    def __init__(self, order_id: str):
        super().__init__()
        self.order_id = order_id

    async def handle(self) -> Order:
        try:
            return await self.storage.order.get(self.order_id)
        except Order.DoesNotExist:
            raise OrderNotFoundError
