from typing import Any, Optional

from aiohttp import web
from aiopg.sa.engine import Engine

from sendr_aiohttp import BaseUrlDispatcher, setup_swagger
from sendr_aiohttp.apispec import create_apispec
from sendr_qlog.http.aiohttp import signal_request_id_header

from pay.sprint.sprint import __version__
from pay.sprint.sprint.api.middlewares import (
    middleware_exceptions_handler,
    middleware_logging_adapter,
    middleware_stats,
)
from pay.sprint.sprint.api.routes.utility import UTILITY_ROUTES
from pay.sprint.sprint.api.routes.web import WEB_ROUTES
from pay.sprint.sprint.conf import settings
from pay.sprint.sprint.interactions.base import BaseInteractionClient, create_connector
from pay.sprint.sprint.utils.db import create_configured_engine


class SprintApplication(web.Application):
    _urls = (
        UTILITY_ROUTES,
        WEB_ROUTES,
    )

    def __init__(self, db_engine: Optional[Engine] = None):
        super().__init__(
            router=BaseUrlDispatcher(),
            middlewares=(
                middleware_stats,
                middleware_logging_adapter,
                middleware_exceptions_handler,
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

    def add_sentry(self) -> None:
        from sendr_qlog.sentry import sentry_init

        if settings.SENTRY_DSN:
            self.on_cleanup.append(sentry_init(settings.SENTRY_DSN, release=__version__))

    # API docs are available at:
    # - 'api/doc' (Swagger UI)
    # - 'api/doc/swagger.json' (raw JSON)
    def setup_swagger(self):
        if not settings.API_SWAGGER_ENABLED:
            return

        spec = create_apispec(
            app=self,
            title='Yandex.Pay Sprint API',
            version='1.0',
        )
        setup_swagger(
            app=self,
            spec=spec,
            ui_version=3,
            api_base_url='/sprint',
        )

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
