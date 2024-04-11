import asyncio

import click
import uvloop

from pay.bill_payments.bill_payments.taskq.app import BillPaymentsWorkerApplication
from pay.bill_payments.bill_payments.utils.logging import configure_logging


@click.command()
@click.option('--port', default=8003, help='Port number')
@click.option('--host', default='127.0.0.1', help='Bind address')
def cli(port, host):
    """Starts workers.
    Usage: manage.py runworkers --port=8003 --host=127.0.0.1
    """

    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
    configure_logging()

    app = BillPaymentsWorkerApplication()

    app.start(port=port, host=host)
