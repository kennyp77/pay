from decimal import Decimal
from json import JSONDecodeError
from typing import Any, Dict, List

from aiohttp import ClientResponse, ContentTypeError

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag

from pay.lib.entities.card import Card
from pay.lib.entities.enums import AuthMethod
from pay.lib.interactions.yandex_pay.entities import CreatePaymentTokenResponse
from pay.lib.interactions.yandex_pay.exceptions import get_exception_by_error_code
from pay.lib.interactions.yandex_pay.schemas import CreatePaymentTokenResponseSchema
from pay.lib.schemas.card import CardSchema


class AbstractYandexPayClient(AbstractInteractionClient[Dict[str, Any]]):
    SERVICE = 'yandex-pay'
    LOG_RESPONSE_BODY = LogFlag.ON_ERROR

    async def _handle_response_error(self, response: ClientResponse) -> None:
        try:
            resp_json = await response.json()
        except (JSONDecodeError, ContentTypeError):
            pass
        else:
            await self._try_log_error_response_body(response)
            data = resp_json.get('data', {})
            if 'message' in data:
                exc_cls = get_exception_by_error_code(data['message'])
                raise exc_cls(
                    status_code=response.status,
                    method=response.method,
                    service=self.SERVICE,
                    params=data,
                )

        await super()._handle_response_error(response)

    async def create_payment_token(
        self,
        uid: int,
        gateway_merchant_id: str,
        card_id: str,
        currency: str,
        amount: Decimal,
        auth_methods: List[AuthMethod],
        psp_external_id: str,
    ) -> CreatePaymentTokenResponse:
        url = self.endpoint_url('api/internal/v1/checkout/payment_tokens')
        params = {
            'uid': uid,
            'gateway_merchant_id': gateway_merchant_id,
            'card_id': card_id,
            'currency': currency,
            'amount': str(amount),
            'auth_methods': [method.value for method in auth_methods],
            'psp_external_id': psp_external_id,
        }

        response_data = await self.post(
            interaction_method='create_payment_token',
            url=url,
            json=params,
        )
        resp, _ = CreatePaymentTokenResponseSchema().load(response_data['data'])
        return resp

    async def get_user_card(self, uid: int, card_id: str) -> Card:
        url = self.endpoint_url(f'api/internal/v1/user/cards/{card_id}')

        response_data = await self.get(
            interaction_method='get_user_card',
            url=url,
            params={'uid': uid},
        )
        resp, _ = CardSchema().load(response_data['data'])
        return resp
