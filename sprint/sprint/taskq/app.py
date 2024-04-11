import asyncio
from typing import Any, Optional

from aiohttp import web

from sendr_aiohttp import Url
from sendr_aiopg.types import EngineUnion
from sendr_taskqueue import BaseStorageWorkerApplication

from pay.sprint.sprint.api.handlers.utility import PingHandler, UnistatHandler
from pay.sprint.sprint.api.middlewares import middleware_logging_adapter
from pay.sprint.sprint.conf import settings
from pay.sprint.sprint.interactions.base import BaseInteractionClient, create_connector
from pay.sprint.sprint.storage import StorageContext
from pay.sprint.sprint.taskq.arbiter import ArbiterWorker
from pay.sprint.sprint.taskq.workers.action import ActionWorker
from pay.sprint.sprint.utils.db import create_configured_engine


class SprintWorkerApplication(BaseStorageWorkerApplication):
    debug = settings.DEBUG
    arbiter_cls = ArbiterWorker
    sentry_dsn = settings.SENTRY_DSN
    middlewares = [
        middleware_logging_adapter,
    ]
    workers = [
        (ActionWorker, settings.TASKQ_ACTION_WORKERS),
    ]
    routes = (
        Url(r'/ping', PingHandler, name='ping'),
        Url(r'/unistat', UnistatHandler, name='unistat'),
    )

    def __init__(self, db_engine: Optional[EngineUnion] = None):
        super().__init__(db_engine=db_engine)
        self.on_startup.append(self.wait_for_pg_pinger_init)

    async def create_connector(self, _: Any) -> None:
        BaseInteractionClient.CONNECTOR = create_connector()

    async def close_connector(self, _: Any) -> None:
        await BaseInteractionClient.close_connector()

    async def wait_for_pg_pinger_init(self, _: Any) -> None:
        for i in range(10):
            try:
                async with StorageContext(db_engine=self.db_engine, logger=self.logger) as storage:
                    await storage.conn.execute('select 1;')
                    return
            except TypeError:
                await asyncio.sleep(1)

        raise RuntimeError('pg_pinger wait attempts have expired')

    async def setup(self, app: web.Application) -> None:
        await super().setup(app)
        await self.create_connector(app)
        self.on_cleanup.append(self.close_connector)

    async def open_engine(self) -> EngineUnion:
        return create_configured_engine()
