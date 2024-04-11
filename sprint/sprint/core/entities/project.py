from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateProjectRequest:
    title: str
    responsible_uid: int
    startrek_issue_key: Optional[str] = None
    yandex_goal_id: Optional[str] = None
