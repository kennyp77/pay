from aiohttp import web

from sendr_auth import skip_authentication
from sendr_qstats.http.aiohttp import get_registry_handler

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.core.actions.ping_db import PingDBAction
from pay.bill_payments.bill_payments.utils.stats import REGISTRY


@skip_authentication
class PingHandler(BaseHandler):
    async def get(self):
        return web.Response(text='pong')


@skip_authentication
class PingDBHandler(BaseHandler):
    async def get(self):
        await self.run_action(PingDBAction)
        return web.Response(text='pong')


UnistatHandler = skip_authentication(get_registry_handler(REGISTRY))
