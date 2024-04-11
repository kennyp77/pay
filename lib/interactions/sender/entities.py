from dataclasses import dataclass
from typing import Optional

from pay.lib.interactions.sender.enums import SenderResultStatus


@dataclass
class SenderResult:
    status: SenderResultStatus


@dataclass
class SenderTransactionalEmailResult(SenderResult):
    task_id: str
    message_id: str


@dataclass
class SenderTransactionalEmailStatus:
    code: int
    retry: Optional[bool] = None
    message: Optional[str] = None


@dataclass
class SenderMaillistSubscriptionCancelResult(SenderResult):
    disabled: bool
    already_disabled: bool
