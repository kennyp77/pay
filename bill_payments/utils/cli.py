import asyncio
import logging
import uuid

from sendr_qlog import LoggerContext

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.core.actions.base import BaseAction
from pay.bill_payments.bill_payments.interactions import InteractionClients
from pay.bill_payments.bill_payments.interactions.base import BaseInteractionClient, create_connector
from pay.bill_payments.bill_payments.storage import Storage
from pay.bill_payments.bill_payments.utils.db import create_configured_engine


def create_shell_context():
    loop = asyncio.get_event_loop()

    BaseInteractionClient.CONNECTOR = create_connector()
    request_id = 'manual_' + uuid.uuid4().hex
    logger = LoggerContext(logging.getLogger(), {'request_id': request_id})
    clients = InteractionClients(logger, request_id)

    db_engine = create_configured_engine()

    conn = loop.run_until_complete(db_engine.acquire().__aenter__())
    storage = Storage(conn)

    BaseAction.context.logger = logger
    BaseAction.context.request_id = request_id
    BaseAction.context.db_engine = db_engine

    return {
        'clients': clients,
        'db_engine': db_engine,
        'logger': logger,
        'request_id': request_id,
        'settings': settings,
        'storage': storage,
    }
