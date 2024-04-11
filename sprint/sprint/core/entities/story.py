from dataclasses import dataclass
from typing import Optional
from uuid import UUID


@dataclass
class CreateStoryRequest:
    project_id: UUID
    title: str
    responsible_uid: int
    startrek_issue_key: Optional[str] = None
