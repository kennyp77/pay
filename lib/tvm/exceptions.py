from typing import ClassVar, Optional

from sendr_auth.exceptions import SecurityException


class BaseTvmServiceException(SecurityException):
    CODE: ClassVar[int] = 403
    MESSAGE: ClassVar[str] = 'FORBIDDEN'

    def __init__(self, code: Optional[int] = None, message: Optional[str] = None):
        code = self.CODE if code is None else code
        message = self.MESSAGE if message is None else message
        super().__init__(code=code, message=message)


class TVMServiceTicketNotAllowedException(BaseTvmServiceException):
    MESSAGE = 'SERVICE_NOT_ALLOWED'


class TVMServiceTicketNotPassedException(BaseTvmServiceException):
    MESSAGE = 'SERVICE_TICKET_NOT_PASSED'


class TVMServiceTicketInvalidException(BaseTvmServiceException):
    MESSAGE = 'SERVICE_TICKET_INVALID'


class TVMUserTicketNotPassedException(BaseTvmServiceException):
    MESSAGE = 'USER_TICKET_NOT_PASSED'


class TVMUserTicketInvalidException(BaseTvmServiceException):
    MESSAGE = 'USER_TICKET_INVALID'
