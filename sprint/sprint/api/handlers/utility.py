from aiohttp import web

from sendr_qstats.http.aiohttp import get_registry_handler

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.core.actions.ping_db import PingDBAction
from pay.sprint.sprint.utils.stats import REGISTRY


class PingHandler(BaseHandler):
    async def get(self):
        return web.Response(text='pong')


class PingDBHandler(BaseHandler):
    async def get(self):
        await self.run_action(PingDBAction)
        return web.Response(text='pong')


UnistatHandler = get_registry_handler(REGISTRY)
