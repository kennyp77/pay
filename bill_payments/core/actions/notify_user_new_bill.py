import uuid
from decimal import Decimal

from sendr_interactions.clients.sup.entities import Data, Notification, PushRequest

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.core.actions.base import BaseAsyncDBAction
from pay.bill_payments.bill_payments.storage.entities.bill import Bill
from pay.bill_payments.bill_payments.storage.entities.enums import TaskType


class NotifyUserNewBillAction(BaseAsyncDBAction):
    task_type = TaskType.RUN_ACTION
    action_name = 'notify_user_new_bill'

    BILL_WITHOUT_DISCOUNT = 'У вас есть неоплаченный штраф на сумму {amount} рублей. Его нужно оплатить до {date_till}'
    BILL_WITH_DISCOUNT = 'У вас есть неоплаченный штраф на сумму {amount} рублей. Его можно оплатить со скидкой {discount}% до {date_till}'

    def __init__(self, bill_id: str):
        self.bill_id = bill_id
        super().__init__()

    def _get_title(self) -> str:
        return 'Штраф ГИБДД'

    def _get_body(self, bill: Bill) -> str:
        amount = Decimal(bill.amount / 100).quantize(Decimal('1.00'))
        if bill.discount_size is not None and bill.discount_date is not None:
            return self.BILL_WITH_DISCOUNT.format(
                amount=str(amount),
                date_till=bill.discount_date.strftime('%d.%m.%Y'),
                discount=bill.discount_size,
            )

        return self.BILL_WITHOUT_DISCOUNT.format(
            amount=amount,
            date_till=bill.payment_deadline.strftime('%d.%m.%Y'),
        )

    async def _get_bill(self) -> Bill:
        return await self.storage.bill.get(self.bill_id)

    async def handle(self):
        if not settings.BILL_PUSH_ENABLED:
            return

        transit_id = str(uuid.uuid4())
        bill = await self._get_bill()
        title = self._get_title()
        body = self._get_body(bill)

        self.logger.context_push(uid=bill.uid, transit_id=transit_id, title=title, body=body)

        response = await self.clients.sup.send_push(
            PushRequest(
                receiver=[f'uid:{bill.uid}'],
                project=settings.BILL_SUP_PROJECT,
                data=Data(
                    push_id='bill_payments',
                    transit_id=transit_id,
                    topic_push=settings.BILL_SUP_TOPIC_PUSH,
                ),
                notification=Notification(
                    title=title,
                    body=body,
                    link='ya-search-app-open://?uri=https%3A%2F%2Fpassport.yandex.ru%2Forder-history%2Fgibdd',
                ),
                schedule='now',
                ttl=3600,
            )
        )

        self.logger.context_push(response=response)
        self.logger.info('Push notification sent')
