from typing import Any, Dict, List

from aiohttp import ClientResponse

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.interactions.kazna.entities import (
    PayerDoc,
    PaymentInfoResponse,
    PayRequest,
    PayResponse,
    SearchRequest,
    SearchResponse,
    UnsubscribeRequest,
)
from pay.bill_payments.bill_payments.interactions.kazna.exceptions import BaseKaznaInteractionError, KaznaAPIError
from pay.bill_payments.bill_payments.interactions.kazna.schemas import (
    PaymentInfoResponseSchema,
    PayRequestSchema,
    PayResponseSchema,
    SearchRequestSchema,
    SearchResponseSchema,
    SubscriptionInfoResponseSchema,
    UnsubscribeRequestSchema,
)
from pay.bill_payments.bill_payments.interactions.zora import BaseZoraClient


class KaznaClient(BaseZoraClient[ClientResponse]):
    """Клиент для поиска задолжностей (штрафы, жкх, итд) и проведения платежей

    Документация: https://st.yandex-team.ru/YANDEXPAY-2565
    """

    SERVICE = 'kazna'
    BASE_URL = settings.KAZNA_API_URL
    TOKEN = settings.KAZNA_TOKEN
    SALT = settings.KAZNA_SALT

    def _get_session_kwargs(self) -> dict:
        kwargs = super()._get_session_kwargs()
        kwargs.setdefault('headers', {})['Authorization'] = f'Bearer {self.TOKEN}'
        return kwargs

    async def _process_response(self, response: ClientResponse, interaction_method: str) -> Dict[str, Any]:
        response_json = await super()._process_response(response, interaction_method)

        if response_json.get('code') is not None:
            raise KaznaAPIError(
                method=interaction_method,
                status_code=response.status,
                service=self.SERVICE,
                params=response_json,
            )

        return response_json

    async def search(self, request: SearchRequest) -> SearchResponse:
        """Запрос Начислений по идентификаторам Пользователя или УИН"""
        data, _ = SearchRequestSchema().dump(request)

        response = await self.post(
            interaction_method='search',
            url=f'{self.BASE_URL}/search',
            json=data,
        )
        data, err = SearchResponseSchema().load(response)
        if err:
            self.logger.error('kazna bad response, %s', err)
        return data

    async def pay(self, request: PayRequest) -> PayResponse:
        data, _ = PayRequestSchema().dump(request)

        response = await self.post(
            interaction_method='pay',
            url=f'{self.BASE_URL}/pay',
            json=data,
        )
        data, err = PayResponseSchema().load(response)
        if err:
            self.logger.error('kazna bad response, %s', err)
        return data

    async def payment_info(self, payment_id: str) -> PaymentInfoResponse:
        self.assert_string_urlsafe_for_path(payment_id)
        response = await self.get(
            interaction_method='payment_info',
            url=f'{self.BASE_URL}/paymentInfo/{payment_id}',
        )
        data, err = PaymentInfoResponseSchema().load(response)
        if err:
            self.logger.error('kazna bad response, %s', err)
        return data

    async def unsubscribe(self, subscription_id: str, documents: List[PayerDoc]) -> None:
        request = UnsubscribeRequest(subscription_id=subscription_id, documents=documents)
        data, _ = UnsubscribeRequestSchema().dump(request)

        response = await self.post(
            interaction_method='unsubscribe',
            url=f'{self.BASE_URL}/unsubscribe',
            json=data,
        )
        status = response.get('status')
        if str(status) != '0':
            self.logger.error('kazna bad response, %s', status)
            raise BaseKaznaInteractionError(
                status_code=200, method='unsubscribe', params=response, service=self.SERVICE
            )

    async def get_subscription(self, subscription_id: str) -> List[PayerDoc]:
        self.assert_string_urlsafe_for_path(subscription_id)
        response = await self.get(
            interaction_method='get_subscription',
            url=f'{self.BASE_URL}/getSubscribeList/{subscription_id}',
        )
        data, err = SubscriptionInfoResponseSchema().load(response)
        if err:
            self.logger.error('kazna bad response, %s', err)
        return data.documents
