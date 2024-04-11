from typing import ClassVar, Dict, Iterable, Type, Union

from aiohttp.web_request import Request

from sendr_tvm.common.exceptions import TicketParsingException
from sendr_tvm.qloud_async_tvm import ServiceTicket, TvmChecker, UserTicket

from pay.lib.tvm.acl_matcher import AclSourceType, TvmAclMatcher
from pay.lib.tvm.exceptions import (
    TVMServiceTicketInvalidException,
    TVMServiceTicketNotAllowedException,
    TVMServiceTicketNotPassedException,
    TVMUserTicketInvalidException,
    TVMUserTicketNotPassedException,
)


class TvmTicketChecker:
    SERVICE_TICKET_HEADER: ClassVar[str] = 'x-ya-service-ticket'
    USER_TICKET_HEADER: ClassVar[str] = 'x-ya-user-ticket'
    TVM_SERVICE_CHECKER_CLS: ClassVar[Type[TvmChecker]] = TvmChecker
    TVM_ACL_MATCHER_CLS: ClassVar[Type[TvmAclMatcher]] = TvmAclMatcher

    def __init__(
        self,
        tvm_client: Union[int, str],
        tvm_url: str,
        tvm_token: str,
        tvm_allowed_src: Iterable[AclSourceType],
        route_acls: Dict[str, Iterable[str]],
    ):
        self.service_checker = self.TVM_SERVICE_CHECKER_CLS(tvm_client, tvm_url, tvm_token)
        self.src_matchers = tuple(self.TVM_ACL_MATCHER_CLS(route_acls, each) for each in tvm_allowed_src)

    def _check_ticket_src(self, ticket_src: int, route_name: str) -> None:
        for src_matcher in self.src_matchers:
            if src_matcher.match(ticket_src, route_name):
                return

        raise TVMServiceTicketNotAllowedException

    async def check_tvm_service_ticket(self, request: Request) -> ServiceTicket:
        ticket = request.headers.get(self.SERVICE_TICKET_HEADER)
        if not ticket:
            raise TVMServiceTicketNotPassedException

        try:
            service_ticket_result = await self.service_checker.parse_service_ticket(ticket)
        except TicketParsingException:
            raise TVMServiceTicketInvalidException

        self._check_ticket_src(service_ticket_result.src, request.match_info.route.name)
        return service_ticket_result

    async def get_tvm_user_ticket(self, request: Request) -> UserTicket:
        ticket = request.headers.get(self.USER_TICKET_HEADER)
        if not ticket:
            raise TVMUserTicketNotPassedException

        try:
            return await self.service_checker.parse_user_ticket(ticket)
        except TicketParsingException:
            raise TVMUserTicketInvalidException
