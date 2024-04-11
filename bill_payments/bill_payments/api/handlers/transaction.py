from sendr_aiohttp.handler import request_schema, response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.handlers.mixins.tvm import TvmCheckMixin
from pay.bill_payments.bill_payments.api.schemas.transaction import TransactionIDSchema, TransactionResponseSchema
from pay.bill_payments.bill_payments.core.actions.transaction.get import GetTransactionAction


class TransactionHandler(TvmCheckMixin, BaseHandler):
    @request_schema(TransactionIDSchema(), location='match_info')
    @response_schema(TransactionResponseSchema())
    async def get(self):
        """Возвращает транзакцию. В том числе, её состояние."""
        data = await self.get_data()
        transcaction = await self.run_action(GetTransactionAction, **data)
        return self.make_response({'data': {'transaction': transcaction}})
