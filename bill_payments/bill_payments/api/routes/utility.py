from sendr_aiohttp import Url

from pay.bill_payments.bill_payments.api.handlers.utility import PingDBHandler, PingHandler, UnistatHandler

UTILITY_ROUTES = (
    Url(r'/ping', PingHandler, name='ping'),
    Url(r'/pingdb', PingDBHandler, name='pingdb'),
    Url(r'/unistat', UnistatHandler, name='unistat'),
)
