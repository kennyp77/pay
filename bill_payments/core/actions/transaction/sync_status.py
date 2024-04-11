from datetime import timedelta

from sendr_utils import utcnow

from pay.bill_payments.bill_payments.core.actions.base import BaseAsyncDBAction
from pay.bill_payments.bill_payments.core.actions.transaction.update_status import UpdateTransactionStatusAction
from pay.bill_payments.bill_payments.interactions.kazna.entities import PaymentStatusCode
from pay.bill_payments.bill_payments.storage.entities.enums import TaskType


class SyncTransactionStatusAction(BaseAsyncDBAction):
    task_type = TaskType.RUN_ACTION
    action_name = 'sync_transaction_status'
    MAX_ATTEMPTS = 30
    SYNC_PERIOD = timedelta(seconds=30)

    def __init__(self, external_payment_id: str, attempt: int = 0) -> None:
        super().__init__()
        self.external_payment_id = external_payment_id
        self.attempt = attempt

    async def handle(self):
        self.logger.context_push(external_payment_id=self.external_payment_id, attempt=self.attempt)

        payment_info = await self.clients.kazna.payment_info(self.external_payment_id)
        self.logger.context_push(payment_status=payment_info.status.code, transaction_id=payment_info.order_id)

        if payment_info.status.code != PaymentStatusCode.CREATED:
            await UpdateTransactionStatusAction(
                transaction_id=payment_info.order_id,
                status=payment_info.status.code,
            ).run()
            self.logger.info('Transaction synced')
        elif self.attempt < self.MAX_ATTEMPTS:
            await SyncTransactionStatusAction(
                external_payment_id=self.external_payment_id,
                attempt=self.attempt + 1,
            ).run_async(run_at=utcnow() + self.SYNC_PERIOD)
            self.logger.info('Payment status re-sync')
        else:
            self.logger.info('Payment status sync stopped')
