class StorageException(Exception):
    pass


class StorageNotFound(StorageException):
    pass


class StorageAlreadyExists(StorageException):
    pass
