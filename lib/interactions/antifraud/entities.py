from dataclasses import dataclass
from enum import Enum, unique
from typing import Optional


@unique
class ChallengeStatus(Enum):
    REQUIRED = 'REQUIRED'
    NOT_REQUIRED = 'NOT_REQUIRED'
    DENY = 'DENY'
    ERROR = 'ERROR'


@dataclass
class Challenge:
    status: ChallengeStatus
    url: Optional[str] = None


@unique
class CashbackAntifraudStatus(Enum):
    OK = 'OK'
    DENY = 'DENY'
    ERROR = 'ERROR'
