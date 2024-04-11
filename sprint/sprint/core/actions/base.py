from typing import ClassVar, Optional, Tuple, Type

from sendr_aiopg.action import BaseDBAction as BDBAction
from sendr_core.action import BaseAction as BAction
from sendr_core.exceptions import BaseCoreError
from sendr_taskqueue import BaseAsyncDBAction as BAsyncDBAction

from pay.sprint.sprint.core.context import CoreContext
from pay.sprint.sprint.interactions import InteractionClients
from pay.sprint.sprint.storage import Storage, StorageContext
from pay.sprint.sprint.storage.entities.enums import TaskType
from pay.sprint.sprint.storage.entities.task import Task


class BaseAction(BAction):
    context = CoreContext()
    non_retryable_errors: ClassVar[Tuple[Type[BaseCoreError], ...]] = ()
    retryable_errors: ClassVar[Tuple[Type[BaseCoreError], ...]] = ()

    def __init__(self):
        super().__init__()
        self._clients = InteractionClients(self.logger, self.request_id)

    @property
    def clients(self) -> InteractionClients:
        return self._clients

    async def _run(self):
        with self.logger:
            async with self.clients:
                return await super()._run()

    @classmethod
    def should_retry_exception(cls, exception: Exception) -> Optional[bool]:
        if isinstance(exception, cls.non_retryable_errors):
            return False
        if isinstance(exception, cls.retryable_errors):
            return True
        return None


class BaseDBAction(BDBAction[Storage], BaseAction):
    storage_context_cls = StorageContext


class BaseAsyncDBAction(BAsyncDBAction, BaseAction):
    storage_context_cls = StorageContext
    task_type = TaskType.RUN_ACTION

    @classmethod
    async def report_task_failure(cls, task: Task, reason: Optional[str]) -> None:
        pass
