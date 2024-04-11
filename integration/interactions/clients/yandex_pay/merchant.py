from typing import Any, Dict, Optional
from decimal import Decimal
from pay.lib.entities.cart import Cart
from pay.lib.entities.shipping import ShippingPrice
from pay.integration.conf import settings
from pay.integration.interactions.base import BaseInteractionClient
from pay.integration.interactions.clients.yandex_pay.schemas import OperationResponseSchema
from pay.integration.interactions.entities import Env
from sendr_utils import without_none
from billing.yandex_pay_plus.yandex_pay_plus.api.schemas.merchant.order import (
    CaptureRequestSchema,
    CancelOrderRequestSchema,
    RefundRequestSchema,
)


class YandexPayMerchantClient(BaseInteractionClient[Dict[str, Any]]):
    SERVICE = 'yandex-pay-merchant-api'
    ENVS = {
        'development': Env(
            base_url='http://localhost:8001',
        ),
        'testing': Env(
            base_url='https://test.pay.yandex.ru',
        ),
        'sandbox': Env(
            base_url='https://sandbox.pay.yandex.ru',
        ),
    }
    ENV = settings.TEST_ENV

    async def get_operation(
        self,
        api_key: str,
        operation_id: str,
    ) -> Dict[str, Any]:
        resp = await self.get(
            'get_operation',
            self.endpoint_url(f'/api/merchant/v1/operations/{operation_id}'),
            headers={'Authorization': f'Api-Key {api_key}'},
        )
        return self._load_object(resp, schema=OperationResponseSchema)

    async def capture(
        self,
        api_key: str,
        order_id: str,
        order_amount: Optional[Decimal] = None,
        external_operation_id: Optional[str] = None,
        cart: Optional[Cart] = None,
        shipping_price: Optional[ShippingPrice] = None,
    ) -> Dict[str, Any]:
        resp = await self.post(
            'capture_order',
            self.endpoint_url(f'/api/merchant/v1/orders/{order_id}/capture'),
            headers={'Authorization': f'Api-Key {api_key}'},
            json=without_none(
                self._dump_object(
                    obj=dict(
                        external_operation_id=external_operation_id,
                        order_amount=order_amount,
                        cart=cart,
                        shipping=shipping_price,
                    ),
                    schema=CaptureRequestSchema,
                ),
            ),
        )
        return self._load_object(resp, schema=OperationResponseSchema)

    async def cancel(
        self,
        api_key: str,
        order_id: str,
        reason: str,
        external_operation_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        resp = await self.post(
            'cancel_order',
            self.endpoint_url(f'/api/merchant/v1/orders/{order_id}/cancel'),
            headers={'Authorization': f'Api-Key {api_key}'},
            json=without_none(
                self._dump_object(
                    obj=dict(
                        external_operation_id=external_operation_id,
                        reason=reason,
                    ),
                    schema=CancelOrderRequestSchema,
                ),
            ),
        )
        return self._load_object(resp, schema=OperationResponseSchema)

    async def refund(
        self,
        api_key: str,
        order_id: str,
        order_amount: Decimal,
        refund_amount: Decimal,
        external_operation_id: Optional[str] = None,
        cart: Optional[Cart] = None,
        shipping_price: Optional[ShippingPrice] = None,
    ) -> Dict[str, Any]:
        resp = await self.post(
            'refund_order',
            self.endpoint_url(f'/api/merchant/v1/orders/{order_id}/refund'),
            headers={'Authorization': f'Api-Key {api_key}'},
            json=without_none(
                self._dump_object(
                    obj=dict(
                        order_amount=order_amount,
                        refund_amount=refund_amount,
                        external_operation_id=external_operation_id,
                        cart=cart,
                        shipping_price=shipping_price,
                    ),
                    schema=RefundRequestSchema,
                ),
            ),
        )
        return self._load_object(resp, schema=OperationResponseSchema)
