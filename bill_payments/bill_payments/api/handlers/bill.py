from sendr_aiohttp.handler import response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.handlers.mixins.tvm import TvmCheckMixin
from pay.bill_payments.bill_payments.api.schemas.bill import BillStateResponseSchema
from pay.bill_payments.bill_payments.core.actions.bill.state import GetBillsStateAction


class BillsHandler(TvmCheckMixin, BaseHandler):
    @response_schema(BillStateResponseSchema())
    async def get(self):
        """Возвращает последние 200 неоплаченных счетов пользователя и состояние синхронизации пользователя."""
        bills_state = await self.run_action(GetBillsStateAction, self.user.uid)
        return self.make_response({'data': bills_state})
