from marshmallow import fields
from marshmallow_dataclass import class_schema

from pay.sprint.sprint.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.sprint.sprint.api.schemas.common import ProjectSchema
from pay.sprint.sprint.core.entities.project import CreateProjectRequest

CreateProjectRequestSchema = class_schema(CreateProjectRequest, base_schema=BaseSchema)


class CreateProjectResponseDataSchema(BaseSchema):
    project = fields.Nested(ProjectSchema, exclude=('stories',))


class CreateProjectResponseSchema(SuccessResponseSchema):
    data = fields.Nested(CreateProjectResponseDataSchema)
