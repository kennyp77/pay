from typing import Any, Optional

from aiohttp import web
from aiopg.sa.engine import Engine

from sendr_aiohttp import BaseUrlDispatcher, setup_swagger
from sendr_aiohttp.apispec import create_apispec
from sendr_auth.middlewares import create_blackbox_middleware
from sendr_interactions.retry_budget import RetryBudget
from sendr_qlog.http.aiohttp import signal_request_id_header

from pay.bill_payments.bill_payments import __version__
from pay.bill_payments.bill_payments.api.middlewares import (
    middleware_exceptions_handler,
    middleware_logging_adapter,
    middleware_stats,
)
from pay.bill_payments.bill_payments.api.routes.external import EXTERNAL_ROUTES
from pay.bill_payments.bill_payments.api.routes.utility import UTILITY_ROUTES
from pay.bill_payments.bill_payments.api.routes.webhooks import WEBHOOKS_ROUTES
from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.interactions.base import BaseInteractionClient, create_connector
from pay.bill_payments.bill_payments.interactions.blackbox import BlackBoxClient
from pay.bill_payments.bill_payments.utils.db import create_configured_engine


class BillPaymentsApplication(web.Application):
    _urls = (
        EXTERNAL_ROUTES,
        UTILITY_ROUTES,
        WEBHOOKS_ROUTES,
    )
    retry_budget = RetryBudget(
        max_tokens=settings.RETRY_BUDGET_MAX_TOKENS,
        token_ratio=settings.RETRY_BUDGET_TOKEN_RATIO,
    )

    def __init__(self, db_engine: Optional[Engine] = None):
        super().__init__(
            router=BaseUrlDispatcher(),
            middlewares=(
                middleware_stats,
                middleware_logging_adapter,
                middleware_exceptions_handler,
                create_blackbox_middleware(
                    client_cls=BlackBoxClient,
                    oauth_scopes=["invalid_scope_8f238727-99d3-49fb-ab22-81cbef37cd35"],
                    host=settings.BLACKBOX_SESSIONID_HOST,
                    retry_budget=self.retry_budget,
                    ignored_path_prefixes={
                        '/api/doc',
                    },
                ),
            ),
        )

        if db_engine:
            self.db_engine = db_engine
        else:
            self.on_startup.append(self.open_engine)
            self.on_cleanup.append(self.close_engine)

        self.add_routes()
        self.add_sentry()
        self.setup_swagger()
        self.on_response_prepare.append(signal_request_id_header)
        self.on_startup.append(self.create_connector)
        self.on_cleanup.append(self.close_engine)
        self.on_cleanup.append(self.close_connector)

    def add_routes(self) -> None:
        for routes in self._urls:
            self.router.add_routes(routes)

    # API docs are available at:
    # - 'api/doc' (Swagger UI)
    # - 'api/doc/swagger.json' (raw JSON)
    def setup_swagger(self):
        if not settings.API_SWAGGER_ENABLED:
            return

        setup_swagger(
            app=self,
            spec=create_apispec(
                app=self,
                title='Bill.Payments API',
                version='1.0',
                security_definitions={},
            ),
            ui_version=3,
        )

    def add_sentry(self) -> None:
        from sendr_qlog.sentry import sentry_init

        if settings.SENTRY_DSN:
            self.on_cleanup.append(sentry_init(settings.SENTRY_DSN, release=__version__))

    async def open_engine(self, _: Any) -> None:
        self.db_engine = create_configured_engine()

    async def close_engine(self, _: web.Application) -> None:
        if self.db_engine:
            self.db_engine.close()
        await self.db_engine.wait_closed()

    async def create_connector(self, _: Any) -> None:
        BaseInteractionClient.CONNECTOR = create_connector()

    async def close_connector(self, _: Any) -> None:
        await BaseInteractionClient.close_connector()
