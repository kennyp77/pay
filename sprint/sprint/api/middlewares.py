import asyncio
import time
from typing import Awaitable, Callable

from aiohttp import web

from sendr_qlog import LoggerContext
from sendr_qlog.http.aiohttp import get_middleware_logging_adapter
from sendr_qstats.http.aiohttp import get_stats_middleware

from pay.sprint.sprint.api.exceptions import APIException
from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.base import fail_response_schema
from pay.sprint.sprint.conf import settings
from pay.sprint.sprint.utils.stats import REGISTRY

HandlerType = Callable[[web.Request], Awaitable[web.Response]]


async def measure_time(coro: Awaitable[web.Response], logger: LoggerContext) -> web.Response:
    start = time.perf_counter()
    try:
        return await coro
    finally:
        elapsed = time.perf_counter() - start
        logger.context_push(response_time=elapsed)


@web.middleware
async def middleware_exceptions_handler(request: web.Request, handler: HandlerType) -> web.Response:
    logger = request['logger']
    logger.context_push(url=request.path)

    try:
        response = await measure_time(handler(request), logger)
        if request.match_info.route.name not in settings.LOG_ACCESS_MUTED_ROUTES:
            logger.context_push(code=response.status)
            logger.info('Request processed successfully')
    except APIException as exc:
        logger.context_push(message=exc.message, code=exc.code)
        if exc.code >= 500:
            logger.exception('An exception occurred while processing request')
        else:
            logger.warning('Request processed with handled exception')
        response = BaseHandler.make_schema_response(
            data=exc,
            schema=fail_response_schema,
            status=exc.code,
        )
    except Exception:
        logger.exception('Unhandled exception')
        raise
    except asyncio.CancelledError:
        logger.exception('Request handler is cancelled')
        raise
    return response


middleware_stats = get_stats_middleware(handle_registry=REGISTRY)

middleware_logging_adapter = get_middleware_logging_adapter()
