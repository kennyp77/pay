from typing import ClassVar, Optional


class APIException(Exception):
    CODE: ClassVar[int] = 500
    MESSAGE: ClassVar[str] = 'Internal server error'
    STATUS: ClassVar[str] = 'fail'
    PARAMS: ClassVar[Optional[dict]] = None

    def __init__(
        self,
        code: Optional[int] = None,
        message: Optional[str] = None,
        status: Optional[str] = None,
        params: Optional[dict] = None,
    ):
        self.code = code or self.CODE
        self.message = message or self.MESSAGE
        self.status = status or self.STATUS
        self.params = params or self.PARAMS

    @property
    def data(self):
        data = {
            'message': self.message,
        }
        if self.params is not None:
            data['params'] = self.params
        return data


class TVMServiceTicketException(APIException):
    CODE = 403
    MESSAGE = 'Service not authorized'


class TVMUserTicketException(APIException):
    CODE = 403
    MESSAGE = 'User not authorized'
