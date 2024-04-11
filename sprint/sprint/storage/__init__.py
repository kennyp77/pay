from sendr_aiopg import StorageAnnotatedMeta, StorageBase, StorageContextBase

from pay.sprint.sprint.storage.mappers.project.mapper import ProjectMapper
from pay.sprint.sprint.storage.mappers.resource_type.mapper import ResourceTypeMapper
from pay.sprint.sprint.storage.mappers.sprint.mapper import SprintMapper
from pay.sprint.sprint.storage.mappers.sprint_goal.mapper import SprintGoalMapper
from pay.sprint.sprint.storage.mappers.sprint_resource.mapper import SprintResourceMapper
from pay.sprint.sprint.storage.mappers.sprint_story_resource.mapper import SprintStoryResourceMapper
from pay.sprint.sprint.storage.mappers.story.mapper import StoryMapper
from pay.sprint.sprint.storage.mappers.task import TaskMapper
from pay.sprint.sprint.storage.mappers.worker import WorkerMapper


class Storage(StorageBase, metaclass=StorageAnnotatedMeta):
    task: TaskMapper
    sprint: SprintMapper
    sprint_goal: SprintGoalMapper
    sprint_resource: SprintResourceMapper
    sprint_story_resource: SprintStoryResourceMapper
    story: StoryMapper
    resource_type: ResourceTypeMapper
    project: ProjectMapper
    worker: WorkerMapper


class StorageContext(StorageContextBase):
    STORAGE_CLS = Storage
