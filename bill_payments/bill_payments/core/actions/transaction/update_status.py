from typing import List, Optional

from transitions import Machine

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.exceptions import BillOrderNotFoundError
from pay.bill_payments.bill_payments.interactions.kazna.entities import PaymentStatusCode
from pay.bill_payments.bill_payments.storage.entities.bill import Bill
from pay.bill_payments.bill_payments.storage.entities.bill_order import BillOrder
from pay.bill_payments.bill_payments.storage.entities.enums import BillStatus, OrderStatus, TransactionStatus
from pay.bill_payments.bill_payments.storage.entities.order import Order
from pay.bill_payments.bill_payments.storage.entities.transaction import Transaction
from pay.bill_payments.bill_payments.utils.stats import transaction_status


class UpdateTransactionStatusAction(BaseDBAction):
    transact = True

    transitions = [
        {'trigger': PaymentStatusCode.CREATED.name, 'source': TransactionStatus.NEW, 'dest': TransactionStatus.NEW},
        {'trigger': PaymentStatusCode.AUTH.name, 'source': TransactionStatus.NEW, 'dest': TransactionStatus.PAID},
        {'trigger': PaymentStatusCode.AUTH.name, 'source': TransactionStatus.PAID, 'dest': TransactionStatus.PAID},
        {
            'trigger': PaymentStatusCode.CANCEL.name,
            'source': TransactionStatus.NEW,
            'dest': TransactionStatus.CANCELLED,
        },
        {
            'trigger': PaymentStatusCode.CANCEL.name,
            'source': TransactionStatus.CANCELLED,
            'dest': TransactionStatus.CANCELLED,
        },
        {
            'trigger': PaymentStatusCode.REFUNDED.name,
            'source': TransactionStatus.PAID,
            'dest': TransactionStatus.REFUNDED,
        },
        {
            'trigger': PaymentStatusCode.REFUNDED.name,
            'source': TransactionStatus.REFUNDED,
            'dest': TransactionStatus.REFUNDED,
        },
    ]

    def __init__(self, *, transaction_id: str, status: PaymentStatusCode) -> None:
        super().__init__()
        self.transaction_id = transaction_id
        self.payment_status = status

    async def handle(self) -> Optional[Transaction]:
        """
        Флоу транзакции в Kazna
             ┌───────┐    ┌─────┐   ┌────────┐
        ────►│created├───►│auth ├──►│refunded├───┐
             └───────┤    └─────┘   └────────┘   │
                     │                           ├─►
                     │    ┌──────┐               │
                     └───►│cancel├───────────────┘
                          └──────┘

        При обновлении статуса платежа в bills обновляется:
        * Статус транзакции
        * Статус заказа
        * Статус счета на оплату (штрафа)

        Заказ НЕ ОТМЕНЯЕТСЯ – чтобы была возможность для текущего заказа провести оплату другой транзакцией

        В простом случае при ОТМЕНЕ транзакции фронт будет создавать НОВЫЙ заказ
        """
        self.logger.context_push(transaction_id=self.transaction_id, status=self.payment_status.name)
        self.logger.info('Transaction status update')

        try:
            transaction = await self.storage.transaction.get(self.transaction_id, for_update=True)
        except Transaction.DoesNotExist:
            self.logger.warning('Transaction not found')
            return None

        machine = Machine(
            states=TransactionStatus,
            transitions=self.transitions,
            initial=transaction.status,
        )
        machine.trigger(self.payment_status.name)

        status: TransactionStatus = machine.state

        transaction_status.labels(status.name).inc()

        if status == transaction.status:
            return transaction

        if status == TransactionStatus.PAID:
            order: Order = await self.storage.order.get(transaction.order_id, for_update=True)
            bill_orders: List[BillOrder] = await self.storage.bill_order.find_by_order_id(order_id=order.order_id)
            if len(bill_orders) == 0:
                raise BillOrderNotFoundError
            for bill in bill_orders:
                b: Bill = await self.storage.bill.get(bill.bill_id, for_update=True)
                b.status = BillStatus.PAID
                await self.storage.bill.save(b)

            order.status = OrderStatus.PAID
            await self.storage.order.save(order)

        transaction.status = status
        return await self.storage.transaction.save(transaction)
