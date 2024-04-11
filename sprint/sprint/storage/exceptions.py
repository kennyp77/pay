class StorageException(Exception):
    pass


class StorageNotFound(StorageException):
    pass


class UserNotFound(StorageNotFound):
    pass
