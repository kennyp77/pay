from sendr_aiohttp.handler import BaseHandler as BHandler
from sendr_aiohttp.handler import BaseParser
from sendr_qlog import LoggerContext

from pay.sprint.sprint.api.exceptions import APIException
from pay.sprint.sprint.core.exceptions import BaseCoreError, CoreNotFoundError


class Parser(BaseParser):
    def handle_error(self, error, *args, **kwargs):
        raise APIException(code=400, message='Bad Request', params=error.messages)


class BaseHandler(BHandler):
    PARSER = Parser()

    @property
    def db_engine(self):
        return self.app.db_engine

    @property
    def logger(self) -> LoggerContext:
        return self.request['logger']

    @property
    def request_id(self) -> str:
        return self.request['request-id']

    def _core_exception_result(self, exc: BaseCoreError) -> None:
        code = 500
        message = getattr(exc, 'message', 'Internal server error')
        params = getattr(exc, 'params', {})
        if isinstance(exc, CoreNotFoundError):
            code = 404
        raise APIException(code=code, message=message, params=params)

    async def run_action(self, action_cls, *args, **kwargs):
        action_cls.context.logger = self.logger
        action_cls.context.request_id = self.request_id
        action_cls.context.db_engine = self.db_engine
        try:
            return await action_cls(*args, **kwargs).run()
        except BaseCoreError as exc:
            self._core_exception_result(exc)
