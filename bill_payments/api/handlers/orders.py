from sendr_aiohttp.handler import request_schema, response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.handlers.mixins.tvm import TvmCheckMixin
from pay.bill_payments.bill_payments.api.schemas.order import OrderResponseSchema, OrderSchema
from pay.bill_payments.bill_payments.core.actions.order.create import CreateOrderAction


class OrdersHandler(TvmCheckMixin, BaseHandler):
    @request_schema(OrderSchema(), location='json')
    @response_schema(OrderResponseSchema())
    async def post(self):
        """
        Создаёт заказ.
        После создания заказа, необходимо создать транзакцию
        """
        data = await self.get_data()
        data['uid'] = self.user.uid
        order = await self.run_action(CreateOrderAction, **data)
        return self.make_response({'data': {'order': order}, 'code': 201}, status=201)
