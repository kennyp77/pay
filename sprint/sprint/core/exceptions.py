from sendr_core.exceptions import BaseCoreError, CoreFailError  # noqa


class CoreNotFoundError(BaseCoreError):
    message = 'NOT_FOUND_ERROR'


class UserNotFoundError(CoreNotFoundError):
    message = 'USER_NOT_FOUND_ERROR'
