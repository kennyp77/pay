from marshmallow import fields
from marshmallow_dataclass import class_schema

from pay.sprint.sprint.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.sprint.sprint.api.schemas.common import SprintResourceSchema
from pay.sprint.sprint.core.entities.sprint_resource import UpsertSprintResourceRequest

UpsertSprintResourceRequestSchema = class_schema(UpsertSprintResourceRequest, base_schema=BaseSchema)


class UpsertSprintResourceResponseDataSchema(BaseSchema):
    sprint_resource = fields.Nested(SprintResourceSchema)


class UpsertSprintResourceResponseSchema(SuccessResponseSchema):
    data = fields.Nested(UpsertSprintResourceResponseDataSchema)
