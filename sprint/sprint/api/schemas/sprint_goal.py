from marshmallow import fields
from marshmallow_dataclass import class_schema

from pay.sprint.sprint.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.sprint.sprint.api.schemas.common import SprintGoalSchema
from pay.sprint.sprint.core.entities.sprint_goal import CreateSprintGoalRequest, UpdateSprintGoalRequest

CreateSprintGoalRequestSchema = class_schema(CreateSprintGoalRequest, base_schema=BaseSchema)


class CreateSprintGoalResponseDataSchema(BaseSchema):
    sprint_goal = fields.Nested(SprintGoalSchema)


class CreateSprintGoalResponseSchema(SuccessResponseSchema):
    data = fields.Nested(CreateSprintGoalResponseDataSchema)


UpdateSprintGoalRequestSchema = class_schema(UpdateSprintGoalRequest, base_schema=BaseSchema)


class UpdateSprintGoalResponseSchema(CreateSprintGoalResponseSchema):
    pass
