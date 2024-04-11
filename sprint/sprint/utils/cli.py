import asyncio
import logging
import uuid

from sendr_qlog import LoggerContext

from pay.sprint.sprint.conf import settings
from pay.sprint.sprint.core.actions.base import BaseAction
from pay.sprint.sprint.interactions import InteractionClients
from pay.sprint.sprint.interactions.base import BaseInteractionClient, create_connector
from pay.sprint.sprint.storage import Storage
from pay.sprint.sprint.utils.db import create_configured_engine


class ShellContext:
    def __init__(self):
        self.inited = False

    def init_context(self):
        if self.inited:
            return
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

        self.clients = clients
        self.db_engine = db_engine
        self.logger = logger
        self.request_id = request_id
        self.settings = settings
        self.storage = storage

        self.inited = True


class ShellContextVariable:
    def __init__(self, name, context):
        self.__name = name
        self.__context = context

    def __getattr__(self, name):
        assert self.__context.inited
        return getattr(getattr(self.__context, self.__name), name)


def create_shell_context():
    context = ShellContext()

    return {
        'clients': ShellContextVariable('clients', context),
        'db_engine': ShellContextVariable('db_engine', context),
        'logger': ShellContextVariable('logger', context),
        'request_id': ShellContextVariable('request_id', context),
        'settings': ShellContextVariable('settings', context),
        'storage': ShellContextVariable('storage', context),
        'shell_context': context,
    }
