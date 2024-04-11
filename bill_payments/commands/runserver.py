import asyncio

import click
import uvloop
from aiohttp import web

from pay.bill_payments.bill_payments.api.app import BillPaymentsApplication
from pay.bill_payments.bill_payments.utils.logging import configure_logging


@click.command()
@click.option('--port', default=8001, help='Port number')
@click.option('--host', default='127.0.0.1', help='Bind address')
def cli(port, host):
    """Starts api web server.
    Usage: manage.py runserver --port=8001 --host=127.0.0.1
    """

    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
    configure_logging()

    app = BillPaymentsApplication()

    web.run_app(app, port=port, host=host)
