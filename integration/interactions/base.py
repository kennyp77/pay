import ssl
from typing import Any, Dict, Optional, Union, Type, TypeVar

import allure
from aiohttp import TCPConnector
from aiosocksy.connector import ProxyClientRequest, ProxyConnector

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag
from sendr_interactions.retry_budget import RetryBudgetProtocol
from sendr_qlog import LoggerContext
from sendr_utils.schemas.base import BaseSchema
from sendr_writers.base.pusher import CommonPushers

from pay.integration.conf import settings
from pay.integration.interactions.entities import Env

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


class BaseInteractionClient(AbstractInteractionClient[ResponseType]):
    ENVS: Dict[str, Env]
    ENV: Optional[str] = None
    DEBUG = settings.DEBUG
    REQUEST_RETRY_TIMEOUTS = settings.REQUEST_RETRY_TIMEOUTS
    LOG_RESPONSE_BODY = LogFlag.ALWAYS
    LOG_CORRELATION_HEADERS = True

    def __init__(
        self,
        logger: LoggerContext,
        request_id: str,
        pushers: Optional[CommonPushers] = None,
        base_url: Optional[str] = None,
        tvm_id: Optional[int] = None,
        retry_budget: Optional[RetryBudgetProtocol] = None,
        env: Optional[Union[str, Env]] = None,
    ):
        environment = self._get_env(
            env=env or self.ENV, base_url=base_url or getattr(self, 'BASE_URL', None), tvm_id=tvm_id
        )
        super().__init__(
            logger=logger,
            request_id=request_id,
            pushers=pushers,
            tvm_id=environment.tvm_id,
            retry_budget=retry_budget,
        )
        self.BASE_URL = environment.base_url

    @classmethod
    def _get_env(cls, env: Optional[Union[str, Env]], base_url: Optional[str], tvm_id: Optional[int]) -> Env:
        if isinstance(env, str):
            environment = cls.ENVS[env]
        elif isinstance(env, Env):
            environment = env
        elif base_url is not None:
            environment = Env(base_url=base_url, tvm_id=tvm_id)
        else:
            environment = cls.ENVS['testing']
        return environment

    async def _request(self, *args, **kwargs) -> ResponseType:
        with allure.step('HTTP Request'):
            return await super()._request(*args, **kwargs)

    async def _make_request(self, *args: Any, **kwargs: Any) -> ResponseType:
        if settings.SOCKS_PROXY:
            kwargs['proxy'] = settings.SOCKS_PROXY
        return await super()._make_request(*args, **kwargs)

    def _get_session_kwargs(self) -> dict:
        kwargs = super()._get_session_kwargs()
        if settings.SOCKS_PROXY:
            kwargs['request_class'] = ProxyClientRequest
        return kwargs

    def _dump_object(self, obj: Any, schema: Type[BaseSchema]) -> Dict[str, Any]:
        d, _ = schema().dump(obj)
        return d

    def _load_object(self, data: Dict[str, Any], schema: Type[BaseSchema]) -> Any:
        obj, _ = schema().load(data)
        return obj

    @classmethod
    async def close_connector(cls):
        if cls.CONNECTOR:
            await cls.CONNECTOR.close()
            cls.CONNECTOR = None
