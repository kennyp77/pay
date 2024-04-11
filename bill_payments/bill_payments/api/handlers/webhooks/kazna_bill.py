from sendr_aiohttp import request_schema, response_schema
from sendr_auth import skip_authentication

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.schemas.base import SuccessResponseSchema
from pay.bill_payments.bill_payments.api.schemas.webhooks.kazna_bill import BillNotificationRequestSchema
from pay.bill_payments.bill_payments.core.actions.bill.create import CreateBillsFromManyNotificationsAction


@skip_authentication
class BillNotificationHandler(BaseHandler):  # TODO: Impl auth
    async def _log_notification(self) -> None:
        data = await self.request.json()
        if not isinstance(data, list):
            self.logger.context_push(notification_type=type(data).__name__)
            self.logger.warning('BILL_NOTIFICATION_WRONG_TYPE')
            return
        notifications = []
        for item in data:
            notification = {}
            if not isinstance(item, dict):
                self.logger.context_push(notification_type=type(item).__name__)
                self.logger.warning('BILL_NOTIFICATION_WRONG_ITEM_TYPE')
                return
            for key in (
                'supplierBillID',
                'subscribe',
                'depType',
                'billDate',
                'amountToPay',
                'amount',
                'payeeName',
                'additionalDataDiscountSize',
                'additionalDataDiscountDate',
            ):
                notification[key] = item.get(key, '>MISSING<')
            notification['!notification_keys'] = list(item.keys())
            notifications.append(notification)
        with self.logger:
            self.logger.context_push(notification=notifications)
            self.logger.info('BILL_NOTIFICATION')

    @request_schema(BillNotificationRequestSchema(many=True), location='json')
    @response_schema(SuccessResponseSchema())
    async def post(self):
        """
        Вебхук для получения новых штрафов от оплатыгосуслуг.
        """
        await self._log_notification()

        data = await self.get_data()
        await self.run_action(CreateBillsFromManyNotificationsAction, notifications=data['list'])
        return self.make_response({'data': {}})
