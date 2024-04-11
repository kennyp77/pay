from marshmallow import fields
from marshmallow_dataclass import class_schema

from pay.sprint.sprint.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.sprint.sprint.api.schemas.common import SprintSchema
from pay.sprint.sprint.core.entities.sprint import CreateSprintRequest, GetSprintsRequest, GetSprintsResponse

GetSprintsRequestSchema = class_schema(GetSprintsRequest, base_schema=BaseSchema)
GetSprintsResponseDataSchema = class_schema(GetSprintsResponse, base_schema=BaseSchema)


class GetSprintsResponseSchema(SuccessResponseSchema):
    data = fields.Nested(GetSprintsResponseDataSchema)


CreateSprintRequestSchema = class_schema(CreateSprintRequest, base_schema=BaseSchema)


class CreateSprintResponseSchemaData(BaseSchema):
    sprint = fields.Nested(SprintSchema, exclude=('goals', 'resources'))


class CreateSprintResponseSchema(SuccessResponseSchema):
    data = fields.Nested(CreateSprintResponseSchemaData)
