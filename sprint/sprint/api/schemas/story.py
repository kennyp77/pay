from marshmallow import fields
from marshmallow_dataclass import class_schema

from pay.sprint.sprint.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.sprint.sprint.api.schemas.common import StorySchema
from pay.sprint.sprint.core.entities.story import CreateStoryRequest

CreateStoryRequestSchema = class_schema(CreateStoryRequest, base_schema=BaseSchema)


class CreateStoryResponseDataSchema(BaseSchema):
    story = fields.Nested(StorySchema, exclude=('sprint_ids',))


class CreateStoryResponseSchema(SuccessResponseSchema):
    data = fields.Nested(CreateStoryResponseDataSchema)
