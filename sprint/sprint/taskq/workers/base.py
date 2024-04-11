from typing import ClassVar, Optional, Tuple, Type, Union

from sendr_taskqueue import BaseStorageWorker, BaseStorageWorkerApplication
from sendr_taskqueue.worker.storage.action import ActionTaskParams
from sendr_taskqueue.worker.storage.db.entities import TaskState
from sendr_utils import copy_context

from pay.sprint.sprint.core.actions.base import BaseAction
from pay.sprint.sprint.storage import Storage, StorageContext
from pay.sprint.sprint.storage.entities.task import Task

ExcType = Type[Exception]


class BaseWorker(BaseStorageWorker):
    app: BaseStorageWorkerApplication
    storage_context_cls = StorageContext
    retry_exceptions: ClassVar[Union[Tuple[Union[ExcType, Tuple[ExcType, bool]], ...], bool]] = True

    @copy_context
    async def _run(self):
        BaseAction.context.logger = self.logger
        BaseAction.context.request_id = self.request_id
        BaseAction.context.db_engine = self.app.db_engine
        BaseAction.context.storage = None

        return await super()._run()

    @staticmethod
    def _split_exception(entry: Union[ExcType, Tuple[ExcType, bool]]) -> Tuple[ExcType, bool]:
        if isinstance(entry, tuple):
            return entry
        return entry, True

    def get_params(self, task: Optional[Task] = None) -> dict:
        """Create context for action"""
        assert task is not None

        if isinstance(task.params, dict):
            params = {
                'max_retries': self.max_retries,
                'action_kwargs': {},
                **task.params,
            }
            task.params = ActionTaskParams(**params)

        return task.params.action_kwargs

    def should_retry_exception(self, action_cls: Type[BaseAction], action_exception: Exception) -> bool:
        retry_flag_from_action = action_cls.should_retry_exception(action_exception)
        if retry_flag_from_action is not None:
            return retry_flag_from_action

        if isinstance(self.retry_exceptions, tuple):
            for each in self.retry_exceptions:
                exc, should_retry_flag = self._split_exception(each)
                if isinstance(action_exception, exc):
                    return should_retry_flag
            return False
        return super().should_retry_exception(action_cls, action_exception)

    async def _report_task_failure(self, reason: Optional[str], task: Task) -> None:
        pass

    async def task_fail(self, reason: Optional[str], task: Task, storage: Storage) -> bool:
        task.state = TaskState.FAILED
        task.details = task.details or {}
        task.details['reason'] = reason
        await self.commit_task(task, storage=storage)
        await self._report_task_failure(reason, task)
        return self.PROCESS_TASK_WITH_NO_PAUSE
