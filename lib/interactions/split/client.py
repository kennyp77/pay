from decimal import Decimal
from json import JSONDecodeError
from typing import Any, Dict, List, Optional

from aiohttp import ClientResponse, ContentTypeError

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag
from sendr_utils import without_none

from pay.lib.interactions.split.entities import (
    YandexSplitOrder,
    YandexSplitOrderCheckoutInfo,
    YandexSplitOrderService,
    YandexSplitOrderServiceType,
    YandexSplitPaymentPlan,
)
from pay.lib.interactions.split.exceptions import get_exception_by_code
from pay.lib.interactions.split.schemas import (
    PaymentPlanSchema,
    SplitOrderCheckoutInfoSchema,
    SplitOrderSchema,
    SplitOrderServiceSchema,
)


class AbstractYandexSplitClient(AbstractInteractionClient):
    """Клиент для сервиса Yandex Split – рассрочка платежей.

    `Документация для внутреннего API <https://a.yandex-team.ru/arc/trunk/arcadia/fintech/bnpl/backend/docs/api.yaml>`_
    """

    SERVICE = 'yandex-split'
    LOG_RESPONSE_BODY = LogFlag.ALWAYS

    async def _handle_response_error(self, response: ClientResponse) -> None:
        try:
            resp_json = await response.json()
        except (JSONDecodeError, ContentTypeError):
            pass
        else:
            if (code := resp_json.get('code')) is not None:
                await self._try_log_error_response_body(response)
                exc_cls = get_exception_by_code(code)
                raise exc_cls(
                    status_code=response.status,
                    method=response.method,
                    service=self.SERVICE,
                    params=resp_json,
                    message=resp_json.get('message'),
                )

        await super()._handle_response_error(response)

    async def get_payment_plans(
        self,
        uid: int,
        currency: str,
        amount: Decimal,
        merchant_id: str,
        login_id: Optional[str] = None,
    ) -> List[YandexSplitPaymentPlan]:
        currency = currency.upper()
        url = self.endpoint_url('plan/check')
        service = YandexSplitOrderService(
            type=YandexSplitOrderServiceType.LOAN,
            amount=amount,
            currency=currency,
        )
        payload = {'services': [SplitOrderServiceSchema().dump(service).data]}
        # if X-Merchant-Id is missing, Split will assume it's a 'Brandshop' merchant
        headers = without_none({'X-Yandex-Uid': str(uid), 'X-Merchant-Id': merchant_id, 'X-Login-Id': login_id})

        with self.logger:
            self.logger.context_push(uid=uid, payload=payload, merchant_id=merchant_id)
            self.logger.info('GET_SPLIT_PAYMENT_PLANS')

        response = await self.post(
            interaction_method='get_payment_plans',
            url=url,
            json=payload,
            headers=headers,
        )
        return PaymentPlanSchema().load_many(response['plans'])

    async def create_order(
        self,
        uid: int,
        login_id: str,
        currency: str,
        amount: Decimal,
        external_order_id: str,
        merchant_id: str,
        plan_id: Optional[str] = None,
        trust_card_id: Optional[str] = None,
        plus_points: Optional[Decimal] = None,
    ) -> YandexSplitOrderCheckoutInfo:
        currency = currency.upper()
        url = self.endpoint_url('order/create')
        consumer_meta: Dict[str, Any] = {'order_ids': [external_order_id]}
        if plus_points is not None and plus_points > 0:
            consumer_meta['plus_points'] = f'{plus_points:f}'
        order_meta = without_none(
            {
                'external_id': external_order_id,
                'card_id': trust_card_id,
                'consumer_meta': consumer_meta,
                'plan_id': plan_id,
            }
        )

        service = YandexSplitOrderService(
            type=YandexSplitOrderServiceType.LOAN,
            amount=amount,
            currency=currency,
        )
        services = [SplitOrderServiceSchema().dump(service).data]
        payload = {'order_meta': order_meta, 'services': services}
        headers = without_none({'X-Yandex-Uid': str(uid), 'X-Merchant-Id': merchant_id, 'X-Login-Id': login_id})

        with self.logger:
            self.logger.context_push(uid=uid, payload=payload, merchant_id=merchant_id, plus_points=plus_points)
            self.logger.info('CREATE_SPLIT_ORDER')

        response = await self.post(
            interaction_method='create_order',
            url=url,
            json=payload,
            headers=headers,
        )
        return SplitOrderCheckoutInfoSchema().load_one(response)

    async def get_order_info(self, uid: int, external_order_id: str) -> YandexSplitOrder:
        # merchant id is not added here intentionally, since Split currently returns
        # an error if X-Merchant-Id is specified: permissions.no_delegate_permissions_for_merchant
        url = self.endpoint_url('order/info')
        headers = {'X-Yandex-Uid': str(uid)}
        params = {'external_id': external_order_id}

        response = await self.get(
            interaction_method='get_order_info',
            url=url,
            headers=headers,
            params=params,
        )
        return SplitOrderSchema().load_one(response)
