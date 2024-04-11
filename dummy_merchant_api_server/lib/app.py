import json
import random
import time

import jwt
from aiohttp import web


class App:
    def __init__(self):
        self.jwks_client = jwt.PyJWKClient('https://sandbox.pay.yandex.ru/api/jwks')

    def run(self):
        app = web.Application(
            middlewares=(self._middleware_log_json_body,),
        )
        app.add_routes(
            [
                web.post('/v1/order/render', self.render_order),
                web.post('/v1/order/create', self.create_order),
                web.post('/v1/webhook', self.webhook),
            ]
        )
        web.run_app(app)

    async def render_order(self, request):
        return self._make_response(
            {
                "status": "success",
                "data": {
                    "currencyCode": 'RUB',
                    "order_amount": "350",
                    "availablePaymentMethods": ['CARD'],
                    "enableCoupons": False,
                    "enableCommentField": False,
                    "requiredFields": {  # Данные пользователя, необходимые для оформления заказа
                        "billingContact": {
                            "name": False,
                            "email": False,
                        },
                        "shippingContact": {"name": True, "email": True, "phone": True},
                    },
                    "cart": {
                        "items": [
                            {
                                "measurements": {"length": 0.2, "weight": 1.5, "width": 0.1, "height": 0.1},
                                "receipt": {"tax": 3},
                                "title": "Слон",
                                "quantity": {"count": "1"},
                                "total": "350.0",
                                "product_id": "p2",
                                "type": "PHYSICAL",
                            }
                        ],
                        "total": {  # Суммарная стоимость корзины (без учёта доставки)
                            "amount": "350.00",
                        },
                    },
                    "shipping": {
                        "availableMethods": ["YANDEX_DELIVERY"],
                        # Опционально. Если используется интеграция с Яндекс Доставкой
                        "yandexDelivery": {
                            "warehouse": {
                                "contact": {
                                    "firstName": "John",
                                    "secondName": None,
                                    "lastName": "Doe",
                                    "email": "john@email.test",
                                    "phone": "+70001112233",
                                },
                                "emergencyContact": {
                                    "firstName": "Mr",
                                    "secondName": None,
                                    "lastName": "Hyde",
                                    "email": "hyde@email.test",
                                    "phone": "+70004445566",
                                },
                                "address": {
                                    "country": "Российская Федерация",
                                    "region": "Москва",
                                    "locality": "Москва",
                                    "district": None,
                                    "street": "Льва Толстого",
                                    "building": "16",
                                    "room": None,
                                    "entrance": None,
                                    "floor": None,
                                    "intercom": None,
                                    "zip": None,
                                    "locale": None,
                                    "comment": None,
                                    "addressLine": "Российская Федерация, Москва, Льва Толстого, 16",  # Полный адрес
                                    "location": {  # optional
                                        "longitude": "37.588592",
                                        "latitude": "55.734045",
                                    },
                                },
                            }
                        },
                    },
                },
            }
        )

    async def create_order(self, request):
        return self._make_response(
            {
                "status": "success",
                "data": {"orderId": f"hmnid-order-{time.time_ns()}-{random.randint(0, 65536)}"},
            }
        )

    async def webhook(self, request):
        return self._make_response(
            {
                'status': 'success',
            }
        )

    def _make_response(self, obj):
        return web.Response(headers={'content-type': 'application/json'}, text=json.dumps(obj))

    @web.middleware
    async def _middleware_log_json_body(self, request: web.Request, handler):
        print(request.match_info.route)
        body = await self._get_request_body(request)
        print(body)
        return await handler(request)

    async def _get_request_body(self, request):
        token = await request.text()
        signing_key = self.jwks_client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            jwt=token,
            key=signing_key.key,
            algorithms=['ES256'],
        )
        return data
