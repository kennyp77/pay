from dataclasses import dataclass

from sendr_taskqueue.worker.storage import Task as BTask
from sendr_taskqueue.worker.storage import TaskState  # noqa


@dataclass
class Task(BTask):
    pass
