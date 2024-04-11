from typing import TYPE_CHECKING, ClassVar

from aiohttp import hdrs, web

from sendr_auth import User, optional_authentication
from sendr_tvm.qloud_async_tvm import TicketParsingException, TvmChecker
from sendr_utils.abc import abstractclass

from pay.bill_payments.bill_payments.api.exceptions import TVMServiceTicketException, TVMUserTicketException
from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.conf import settings

if TYPE_CHECKING:
    _TvmCheckMixinBase = BaseHandler
else:
    _TvmCheckMixinBase = object


@abstractclass
@optional_authentication
class TvmCheckMixin(_TvmCheckMixinBase):
    TVM_CHECKER: ClassVar[TvmChecker] = TvmChecker(settings.TVM_CLIENT, settings.TVM_URL, settings.TVM_TOKEN)

    async def _check_tvm_tickets(self):
        service_ticket = self.request.headers.get('x-ya-service-ticket')
        if not service_ticket:
            raise TVMServiceTicketException(message='Missing service ticket')

        try:
            service_ticket_result = await self.TVM_CHECKER.parse_service_ticket(service_ticket)
        except TicketParsingException as exc:
            raise TVMServiceTicketException from exc

        if service_ticket_result.src not in settings.TVM_ALLOWED_CLIENTS:
            raise TVMServiceTicketException(message=f'Not allowed for {service_ticket_result.src}')

        user_ticket = self.request.headers.get('x-ya-user-ticket')
        if not user_ticket:
            raise TVMUserTicketException(message='Missing user ticket')

        try:
            user_ticket_result = await self.TVM_CHECKER.parse_user_ticket(user_ticket)
            self.request['user'] = User(uid=user_ticket_result.uid)
            self.logger.context_push(uid=user_ticket_result.uid, auth_source='user_ticket')
        except TicketParsingException as exc:
            raise TVMUserTicketException from exc

    async def _iter(self) -> web.Response:
        if self.request.method != hdrs.METH_OPTIONS and (
            not settings.API_BLACKBOX_AUTHENTICATION_ENABLED or not self.request.get('user')
        ):
            await self._check_tvm_tickets()

        return await super()._iter()
