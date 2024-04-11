from copy import deepcopy
from typing import Any, ClassVar, Dict, Optional, Tuple, Type

from sendr_taskqueue.worker.storage.action import BaseActionStorageWorker

from pay.sprint.sprint.core.actions.base import BaseAction, BaseAsyncDBAction
from pay.sprint.sprint.core.actions.user import GetUserAsyncAction
from pay.sprint.sprint.core.exceptions import UserNotFoundError
from pay.sprint.sprint.storage.entities.enums import TaskType, WorkerType
from pay.sprint.sprint.storage.entities.task import Task
from pay.sprint.sprint.taskq.workers.base import BaseWorker


class ActionWorker(BaseWorker, BaseActionStorageWorker):
    task_type = TaskType.RUN_ACTION
    worker_type = WorkerType.RUN_ACTION
    actions: ClassVar[Tuple[Type[BaseAsyncDBAction], ...]] = (GetUserAsyncAction,)
    retry_exceptions = True
    suppress_exceptions: ClassVar[Tuple[Type[Exception], ...]] = (UserNotFoundError,)

    def get_params(self, task: Optional[Task] = None) -> Dict[str, Any]:
        params = deepcopy(super().get_params(task))
        action_cls = self.get_action_class(task)
        if issubclass(action_cls, BaseAsyncDBAction):
            params = action_cls.deserialize_kwargs(params)
        return params

    async def _report_task_failure(self, reason: Optional[str], task: Task) -> None:
        action_cls = self.get_action_class(task)

        if issubclass(action_cls, BaseAction):
            try:
                await action_cls.report_task_failure(task=task, reason=reason)
            except Exception:
                self.logger.exception('Task failure report exception')
