from sendr_aiohttp.handler import response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.handlers.mixins.tvm import TvmCheckMixin
from pay.bill_payments.bill_payments.api.schemas.base import SuccessResponseSchema
from pay.bill_payments.bill_payments.core.actions.bill.force_search import ForceSearchBillsAction


class SearchBillsHandler(TvmCheckMixin, BaseHandler):
    @response_schema(SuccessResponseSchema())
    async def post(self):
        """Инициирует новый поиск штрафов

        Штрафы должны приходить автоматически от бэка казны. Но на случай если что-то пошло не так,
        эта ручка даёт возможность дёрнуть поиск самостоятельно.
        """
        await self.run_action(ForceSearchBillsAction, uid=self.user.uid)
        return self.make_response({'data': {}})
