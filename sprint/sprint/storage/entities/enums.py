from enum import Enum, unique

from sendr_taskqueue import BaseTaskType


@unique
class TaskType(BaseTaskType):
    RUN_ACTION = 'run_action'


@unique
class WorkerType(Enum):
    RUN_ACTION = 'run_action'
