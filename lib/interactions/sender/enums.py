from enum import Enum, unique


@unique
class SenderResultStatus(Enum):
    OK = 'OK'
    ERROR = 'ERROR'
