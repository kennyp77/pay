from dataclasses import dataclass, field
from typing import Optional
from uuid import UUID

from marshmallow import fields

from sendr_utils import MISSING, MaybeMissing


@dataclass
class CreateSprintGoalRequest:
    title: str
    parent_goal_id: Optional[UUID] = None


@dataclass
class UpdateSprintGoalRequest:
    title: MaybeMissing[str] = field(default=MISSING, metadata={'marshmallow_field': fields.String(required=False)})
    done: MaybeMissing[bool] = field(default=MISSING, metadata={'marshmallow_field': fields.Boolean(required=False)})
    deleted: MaybeMissing[bool] = field(default=MISSING, metadata={'marshmallow_field': fields.Boolean(required=False)})
