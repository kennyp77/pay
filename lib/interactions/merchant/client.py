from __future__ import annotations

from json import JSONDecodeError
from typing import Any, Dict, List, Optional, Type, TypeVar
from uuid import UUID

from aiohttp import ClientResponse, ContentTypeError
from marshmallow.exceptions import ValidationError

from sendr_interactions.base import AbstractInteractionClient, LogFlag
from sendr_interactions.clients.zora import AbstractZoraClient
from sendr_utils import json_value
from sendr_utils.jwt import get_jwt_signature
from sendr_utils.schemas.base import BaseSchema

from pay.lib.entities.cart import Cart
from pay.lib.entities.order import Contact, Order
from pay.lib.entities.payment_sheet import PaymentOrder
from pay.lib.entities.shipping import BoundingBox, PickupOption
from pay.lib.interactions.merchant.entities import (
    EventType,
    MerchantCreateOrderRequest,
    MerchantCreateOrderResponse,
    MerchantCreateOrderV1Response,
    MerchantPickupOptionDetailsRequest,
    MerchantPickupOptionDetailsResponse,
    MerchantPickupOptionsRequest,
    MerchantPickupOptionsResponse,
    MerchantRenderOrderResponse,
    MerchantResponse,
    MerchantWebhookRequest,
    MerchantWebhookV1Request,
    ShippingMethodInfo,
    UpdateTransactionStatusRequest,
)
from pay.lib.interactions.merchant.exceptions import MerchantAPIMalformedResponseError, MerchantAPIResponseError
from pay.lib.interactions.merchant.schemas import (
    MerchantCreateOrderRequestSchema,
    MerchantCreateOrderV1RequestSchema,
    MerchantCreateOrderV1ResponseSchema,
    MerchantErrorResponseSchema,
    MerchantPickupOptionDetailsRequestSchema,
    MerchantPickupOptionDetailsResponseSchema,
    MerchantPickupOptionsRequestSchema,
    MerchantPickupOptionsResponseSchema,
    MerchantRenderOrderRequestSchema,
    MerchantRenderOrderResponseSchema,
    MerchantSuccessResponseSchema,
    MerchantWebhookRequestSchema,
    MerchantWebhookV1RequestSchema,
)

MethodResponseType = TypeVar('MethodResponseType')


class AbstractMerchantClient(AbstractInteractionClient[Dict[str, Any]]):
    """Клиент для работы с Merchant API.

    Документация к API: https://a.yandex-team.ru/arc/trunk/arcadia/billing/yandex_pay/docs/merchant-api.md
    """

    SERVICE = 'merchant_client'
    LOG_RESPONSE_BODY = LogFlag.ALWAYS
    JWK: Optional[Dict[str, str]] = None
    JWT_TTL_SECONDS = 300

    async def _handle_response_error(self, response: ClientResponse) -> None:
        try:
            resp_json = await response.json()
        except (JSONDecodeError, ContentTypeError):
            resp_json = None

        if resp_json is not None:
            try:
                resp, _ = MerchantErrorResponseSchema().load(resp_json)
            except ValidationError:
                pass
            else:
                await self._try_log_error_response_body(response)
                raise MerchantAPIResponseError(
                    status_code=response.status,
                    method=response.method,
                    service=self.SERVICE,
                    reason_code=resp.reason_code.value,
                    reason=resp.reason,
                )

        await super()._handle_response_error(response)

    def _parse_response_data(self, response: Dict[str, Any], schema: Type[BaseSchema]) -> MethodResponseType:
        try:
            resp, _ = schema().load(response)
        except ValidationError as exc:
            raise MerchantAPIMalformedResponseError(service=self.SERVICE, validation_errors=exc.messages)
        return resp

    async def _format_response(self, response: ClientResponse) -> Dict[str, Any]:
        """
        encoding='utf-8-sig' - важно. https://st.yandex-team.ru/YANDEXPAY-4454
        """
        try:
            payload = await response.json(encoding='utf-8-sig')
        except (JSONDecodeError, ContentTypeError):
            with self.logger:
                self.logger.context_push(**await self._get_response_body(response))
                # logger.exception распечатает детали, что ОЧЕНЬ полезно. Кстати, может быть, тут вообще стоит падать?
                self.logger.exception('UNABLE_TO_DESERIALIZE_MERCHANT_RESPONSE')
            payload = {}
        return payload or {}

    def _body(self, data: Dict[str, Any]) -> bytes:
        return get_jwt_signature(self.JWK, json_value(data), ttl_seconds=self.JWT_TTL_SECONDS).encode('utf-8')

    async def update_transaction_status(
        self, *, base_url: str, merchant_id: UUID, data: UpdateTransactionStatusRequest
    ) -> MerchantResponse:
        url = self.endpoint_url('webhook', base_url_override=base_url)
        request = MerchantWebhookRequest(
            merchant_id=merchant_id,
            event=EventType.TRANSACTION_STATUS_UPDATE,
            data=data,
        )
        composed, _ = MerchantWebhookRequestSchema().dump(request)
        body = self._body(composed)

        response = await self.post(interaction_method='update_transaction_status', url=url, data=body)
        return self._parse_response_data(response, schema=MerchantSuccessResponseSchema)

    async def notify(self, *, base_url: str, request: MerchantWebhookV1Request) -> MerchantResponse:
        url = self.endpoint_url('v1/webhook', base_url_override=base_url)
        composed, _ = MerchantWebhookV1RequestSchema().dump(request)
        body = self._body(composed)

        response = await self.post(interaction_method='notify_merchant', url=url, data=body)
        return self._parse_response_data(response, schema=MerchantSuccessResponseSchema)

    async def create_order_v1(
        self,
        *,
        base_url: str,
        order: Order,
    ) -> MerchantCreateOrderResponse:
        if order.shipping_method is not None:
            assert order.shipping_method.has_exactly_one_option()

        url = self.endpoint_url('v1/order/create', base_url_override=base_url)
        data, _ = MerchantCreateOrderV1RequestSchema().dump(order)
        body = self._body(data)

        response = await self.post(interaction_method='create_order', url=url, data=body)
        resp: MerchantCreateOrderV1Response = self._parse_response_data(
            response, schema=MerchantCreateOrderV1ResponseSchema
        )
        return resp.data

    async def create_order(
        self,
        *,
        base_url: str,
        merchant_id: UUID,
        currency_code: str,
        order: PaymentOrder,
        shipping_method_info: Optional[ShippingMethodInfo] = None,
        shipping_contact: Optional[Contact] = None,
    ) -> MerchantResponse:
        url = self.endpoint_url('/order/create', base_url_override=base_url)
        request = MerchantCreateOrderRequest(
            merchant_id=merchant_id,
            currency_code=currency_code,
            order=order,
            shipping_method_info=shipping_method_info,
            shipping_contact=shipping_contact,
        )
        data, _ = MerchantCreateOrderRequestSchema().dump(request)
        body = self._body(data)

        response = await self.post(interaction_method='create_order', url=url, data=body)
        return self._parse_response_data(response, schema=MerchantSuccessResponseSchema)

    async def render_order(
        self,
        *,
        base_url: str,
        order: Order,
    ) -> Order:
        url = self.endpoint_url('/v1/order/render', base_url_override=base_url)
        data, _ = MerchantRenderOrderRequestSchema().dump(order)
        body = self._body(data)

        response = await self.post(interaction_method='render_order', url=url, data=body)
        resp: MerchantRenderOrderResponse = self._parse_response_data(
            response, schema=MerchantRenderOrderResponseSchema
        )
        return resp.data

    async def get_pickup_options(
        self,
        *,
        base_url: str,
        merchant_id: UUID,
        currency_code: str,
        cart: Cart,
        bounding_box: BoundingBox,
        metadata: Optional[str] = None,
    ) -> List[PickupOption]:
        url = self.endpoint_url('/v1/pickup-options', base_url_override=base_url)
        request = MerchantPickupOptionsRequest(
            merchant_id=merchant_id,
            currency_code=currency_code,
            cart=cart,
            bounding_box=bounding_box,
            metadata=metadata,
        )
        data, _ = MerchantPickupOptionsRequestSchema().dump(request)
        body = self._body(data)

        response = await self.post(interaction_method='get_pickup_options', url=url, data=body)
        resp: MerchantPickupOptionsResponse = self._parse_response_data(
            response, schema=MerchantPickupOptionsResponseSchema
        )
        return resp.data.pickup_options

    async def get_pickup_option_details(
        self,
        *,
        base_url: str,
        merchant_id: UUID,
        currency_code: str,
        cart: Cart,
        pickup_point_id: str,
        metadata: Optional[str] = None,
    ) -> PickupOption:
        url = self.endpoint_url('/v1/pickup-option-details', base_url_override=base_url)
        request = MerchantPickupOptionDetailsRequest(
            merchant_id=merchant_id,
            currency_code=currency_code,
            cart=cart,
            pickup_point_id=pickup_point_id,
            metadata=metadata,
        )
        data, _ = MerchantPickupOptionDetailsRequestSchema().dump(request)
        body = self._body(data)

        response = await self.post(interaction_method='get_pickup_option_details', url=url, data=body)
        resp: MerchantPickupOptionDetailsResponse = self._parse_response_data(
            response, schema=MerchantPickupOptionDetailsResponseSchema
        )
        return resp.data.pickup_option


class AbstractZoraMerchantClient(AbstractMerchantClient, AbstractZoraClient):
    ZORA_FOLLOW_REDIRECTS = True
