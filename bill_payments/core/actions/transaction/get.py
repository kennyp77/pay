from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.actions.transaction.update_status import UpdateTransactionStatusAction
from pay.bill_payments.bill_payments.core.exceptions import TransactionNotFoundError
from pay.bill_payments.bill_payments.interactions.kazna.entities import PaymentStatusCode
from pay.bill_payments.bill_payments.storage.entities.enums import TransactionStatus
from pay.bill_payments.bill_payments.storage.entities.transaction import Transaction


class GetTransactionAction(BaseDBAction):
    allow_replica_read = True

    def __init__(self, transaction_id: str):
        super().__init__()
        self.transaction_id = transaction_id

    async def _update_transaction_status(self, transaction: Transaction) -> Transaction:
        payment_info = await self.clients.kazna.payment_info(transaction.external_payment_id)
        self.logger.context_push(payment_status=payment_info.status.code)

        if payment_info.status.code == PaymentStatusCode.CREATED:
            return transaction

        transaction = await UpdateTransactionStatusAction(
            transaction_id=self.transaction_id,
            status=payment_info.status.code,
        ).run()
        assert transaction is not None
        return transaction

    async def handle(self) -> Transaction:
        self.logger.context_push(transaction_id=self.transaction_id)
        try:
            transaction = await self.storage.transaction.get(self.transaction_id)
            if transaction.status == TransactionStatus.NEW:
                transaction = await self._update_transaction_status(transaction)
            return transaction
        except Transaction.DoesNotExist:
            raise TransactionNotFoundError
