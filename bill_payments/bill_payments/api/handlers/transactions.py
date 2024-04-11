from sendr_aiohttp.handler import request_schema, response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.handlers.mixins.tvm import TvmCheckMixin
from pay.bill_payments.bill_payments.api.schemas.transaction import (
    CreateTransactionResponseSchema,
    OrderIDSchema,
    TransactionSchema,
)
from pay.bill_payments.bill_payments.core.actions.transaction.create import CreateTransactionAction


class TransactionsHandler(TvmCheckMixin, BaseHandler):
    @request_schema(OrderIDSchema(), location='match_info')
    @request_schema(TransactionSchema(), location='json')
    @response_schema(CreateTransactionResponseSchema())
    async def post(self):
        """
        Запускает транзакцию.
        """
        data = await self.get_data()
        data['uid'] = self.user.uid
        transaction = await self.run_action(CreateTransactionAction, **data)
        return self.make_response({'data': {'transaction': transaction}, 'code': 201}, status=201)
