import ssl
from typing import Any, TypeVar

from aiohttp import TCPConnector
from aiosocksy.connector import ProxyClientRequest, ProxyConnector

from sendr_interactions import AbstractInteractionClient
from sendr_tvm import qloud_async_tvm
from sendr_tvm.client.aiohttp import sessions_producer

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.utils.stats import (
    interaction_method_response_status,
    interaction_method_response_time,
    interaction_response_status,
    interaction_response_time,
)
from pay.bill_payments.bill_payments.utils.tvm import TVM_CONFIG

SSL_CONTEXT = ssl.create_default_context()
if settings.CA_FILE is not None:
    SSL_CONTEXT.load_verify_locations(cafile=settings.CA_FILE)


def create_connector():
    Connector = TCPConnector
    if settings.SOCKS_PROXY:
        Connector = ProxyConnector
    return Connector(
        keepalive_timeout=settings.KEEPALIVE_TIMEOUT,
        limit=settings.CONNECTION_LIMIT,
        ssl=SSL_CONTEXT,
    )


ResponseType = TypeVar('ResponseType')

BillPaymentsClientSession = sessions_producer(get_tvm=lambda: qloud_async_tvm.QTVM(**TVM_CONFIG))


class BaseInteractionClient(AbstractInteractionClient[ResponseType]):
    DEBUG = settings.DEBUG
    REQUEST_RETRY_TIMEOUTS = settings.REQUEST_RETRY_TIMEOUTS
    TVM_SESSION_CLS = BillPaymentsClientSession
    CONNECTOR = create_connector()

    async def _make_request(self, *args: Any, **kwargs: Any) -> ResponseType:
        if settings.SOCKS_PROXY:
            kwargs['proxy'] = settings.SOCKS_PROXY
        return await super()._make_request(*args, **kwargs)

    def _get_session_kwargs(self) -> dict:
        kwargs = super()._get_session_kwargs()
        if settings.SOCKS_PROXY:
            kwargs['request_class'] = ProxyClientRequest
            kwargs['trust_env'] = True
        return kwargs

    @classmethod
    def _response_time_metrics(cls, interaction_method: str, response_time: int) -> None:
        interaction_response_time.labels(cls.SERVICE).observe(response_time)
        interaction_method_response_time.labels(cls.SERVICE, interaction_method).observe(response_time)

    @classmethod
    def _response_status_metrics(cls, interaction_method: str, status: int) -> None:
        short_status = str(status // 100) + 'xx'
        interaction_response_status.labels(cls.SERVICE, short_status).inc()
        interaction_method_response_status.labels(cls.SERVICE, interaction_method, short_status).inc()

    def endpoint_url(self, relative_url, base_url_override=None):
        return f'{base_url_override or self.BASE_URL}/{relative_url}'

    @classmethod
    async def close_connector(cls):
        if cls.CONNECTOR:
            await cls.CONNECTOR.close()
            cls.CONNECTOR = None
