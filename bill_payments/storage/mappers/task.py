from sendr_taskqueue.worker.storage import get_task_mapper
from sendr_taskqueue.worker.storage.db.tables import get_tasks_table

from pay.bill_payments.bill_payments.storage.db.tables import metadata
from pay.bill_payments.bill_payments.storage.entities.enums import TaskType
from pay.bill_payments.bill_payments.storage.entities.task import Task

t_tasks = get_tasks_table(metadata, TaskType)

TaskMapper = get_task_mapper(metadata=metadata, task_type_cls=TaskType, task_cls=Task, t_tasks=t_tasks)
