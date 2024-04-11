from typing import Optional

from sendr_aiohttp.handler import BaseHandler as BHandler
from sendr_aiohttp.handler import BaseParser
from sendr_auth.entities import User
from sendr_qlog import LoggerContext

from pay.bill_payments.bill_payments.api.exceptions import APIException
from pay.bill_payments.bill_payments.core.exceptions import (
    BaseCoreError,
    CoreAlreadyExistsError,
    CoreDataError,
    CoreNotFoundError,
)


class Parser(BaseParser):
    def handle_error(self, error, *args, **kwargs):
        raise APIException(code=400, message='SCHEMA_VALIDATION_ERROR', params=error.messages)


def raise_core_exception_result(exc: BaseCoreError) -> None:
    code = 500
    message = getattr(exc, 'message', 'Internal server error')
    params = getattr(exc, 'params', {})
    if isinstance(exc, CoreNotFoundError):
        code = 404
    if isinstance(exc, CoreAlreadyExistsError):
        code = 409
    if isinstance(exc, CoreDataError):
        code = 400
    raise APIException(code=code, message=message, params=params) from exc


class BaseHandler(BHandler):
    PARSER = Parser()

    @property
    def db_engine(self):
        return self.app.db_engine

    @property
    def logger(self) -> LoggerContext:
        return self.request['logger']

    @property
    def user(self) -> Optional[User]:
        return self.request.get('user')

    @property
    def request_id(self) -> str:
        return self.request['request-id']

    async def run_action(self, action_cls, *args, **kwargs):
        action_cls.context.logger = self.logger
        action_cls.context.request_id = self.request_id
        action_cls.context.db_engine = self.db_engine
        try:
            return await action_cls(*args, **kwargs).run()
        except BaseCoreError as exc:
            raise_core_exception_result(exc)
