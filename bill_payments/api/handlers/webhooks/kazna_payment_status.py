from sendr_aiohttp.handler import request_schema, response_schema
from sendr_auth import skip_authentication

from pay.bill_payments.bill_payments.api.exceptions import WrongRequestSignature
from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.schemas.base import SuccessResponseSchema
from pay.bill_payments.bill_payments.api.schemas.webhooks.kazna_payment_status import (
    KaznaPaymentStatusSchema,
    WebhookPaymentInfoRequest,
)
from pay.bill_payments.bill_payments.core.actions.transaction.update_status import UpdateTransactionStatusAction


@skip_authentication
class KaznaPaymentStatusHandler(BaseHandler):
    @request_schema(KaznaPaymentStatusSchema(), location='json')
    @response_schema(SuccessResponseSchema())
    async def post(self):
        """
        Вебхук для получения статусов платежей от оплатыгосуслуг.
        """
        data = await self.get_data()
        request: WebhookPaymentInfoRequest = data[WebhookPaymentInfoRequest.__name__.lower()]

        if not request.check_signature():
            self.logger.context_push(
                payment_id=request.payment_id,
                status=request.status.name,
                sign=request.sign,
            )
            self.logger.error('WRONG_REQUEST_SIGNATURE')
            raise WrongRequestSignature

        await self.run_action(
            UpdateTransactionStatusAction, transaction_id=request.order_id, status=request.status.code
        )
        return self.make_response({'data': {}})
