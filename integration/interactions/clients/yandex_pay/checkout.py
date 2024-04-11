from time import time
from typing import Any, Dict, Optional
from uuid import UUID

from pay.lib.entities.threeds import ThreeDSBrowserDataPayload
from pay.lib.schemas.threeds import ThreeDSBrowserDataPayloadSchema
from pay.integration.interactions.base import BaseInteractionClient
from pay.integration.interactions.entities import Env, WebUser
from pay.integration.conf import settings
from billing.yandex_pay_plus.yandex_pay_plus.api.schemas.form.order_create import (
    OrderCreateRequestSchema,
    OrderCreateResponseSchema,
)
from billing.yandex_pay_plus.yandex_pay_plus.api.schemas.form.transaction import (
    TransactionsCreateResponseSchema,
    TransactionActionViewResponseSchema,
)
from billing.yandex_pay_plus.yandex_pay_plus.core.entities.form_order import CreateMerchantOrderRequest
from sendr_auth.csrf import CsrfChecker
from sendr_auth.entities import User


class YandexPayCheckoutClient(BaseInteractionClient[Dict[str, Any]]):
    SERVICE = 'yandex-pay-checkout'
    ENVS = {
        'development': Env(
            base_url='http://localhost:8001/api/public',
        ),
        'testing': Env(
            base_url='https://test.pay.yandex.ru/api',
        ),
        'sandbox': Env(
            base_url='https://sandbox.pay.yandex.ru/api',
        ),
    }
    ENV = settings.TEST_ENV
    CSRF_SECRET = settings.PLUS_CSRF_SECRET

    async def create_order(
        self, pay_session_id: str, request: CreateMerchantOrderRequest, user: WebUser
    ) -> Dict[str, Any]:
        resp = await self.post(
            'create_order',
            self.endpoint_url('/v1/orders/create'),
            headers={'x-pay-session-id': pay_session_id},
            cookies=user.cookies,
            uid=user.uid,
            json=self._dump_object(obj=request, schema=OrderCreateRequestSchema),
        )
        return self._load_object(resp, schema=OrderCreateResponseSchema)

    async def create_transaction(
        self,
        order_id: UUID,
        card_id: str,
        threeds_payload: ThreeDSBrowserDataPayload,
        user: WebUser,
    ) -> Dict[str, Any]:
        resp = await self.post(
            'create_transaction',
            self.endpoint_url(f'/v1/orders/{order_id}/transactions'),
            json={
                'card_id': card_id,
                'browser_data': self._dump_object(obj=threeds_payload, schema=ThreeDSBrowserDataPayloadSchema),
                'challenge_return_path': 'https://any.yandex.test',
            },
            cookies=user.cookies,
            uid=user.uid,
        )
        return self._load_object(resp, schema=TransactionsCreateResponseSchema)

    async def get_transaction(
        self,
        transaction_id: UUID,
        user: WebUser,
    ) -> Dict[str, Any]:
        resp = await self.get(
            'get_transaction',
            self.endpoint_url(f'/v1/transactions/{transaction_id}'),
            cookies=user.cookies,
            uid=user.uid,
        )
        return self._load_object(resp, schema=TransactionActionViewResponseSchema)

    async def _request(
        self,
        interaction_method: str,
        method: str,
        *args: Any,
        uid: Optional[int] = None,
        cookies: Optional[Dict[str, str]] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        if uid is not None and cookies is not None:
            headers = kwargs.setdefault('headers', {})
            headers['X-CSRF-Token'] = CsrfChecker.generate_token(
                key=self.CSRF_SECRET,
                timestamp=int(time()),
                user=User(uid=uid),
                yandexuid=cookies.get('yandexuid'),
            )
        return await super()._request(interaction_method, method, *args, cookies=cookies, **kwargs)
