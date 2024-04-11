from marshmallow import fields
from marshmallow_dataclass import class_schema

from pay.sprint.sprint.api.schemas.base import BaseSchema
from pay.sprint.sprint.storage.entities.project import Project
from pay.sprint.sprint.storage.entities.sprint import Sprint
from pay.sprint.sprint.storage.entities.sprint_goal import SprintGoal
from pay.sprint.sprint.storage.entities.sprint_resource import SprintResource
from pay.sprint.sprint.storage.entities.story import Story

ProjectSchema = class_schema(Project, base_schema=BaseSchema)
SprintSchema = class_schema(Sprint, base_schema=BaseSchema)
StorySchema = class_schema(Story, base_schema=BaseSchema)
SprintGoalSchema = class_schema(SprintGoal, base_schema=BaseSchema)
SprintResourceSchema = class_schema(SprintResource, base_schema=BaseSchema)


class SprintIDSchema(BaseSchema):
    sprint_id = fields.UUID(required=True)


class SprintGoalIDSchema(BaseSchema):
    sprint_goal_id = fields.UUID(required=True)
