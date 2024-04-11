from copy import deepcopy
from typing import Any, ClassVar, Dict, Optional, Tuple, Type

from sendr_taskqueue.worker.storage.action import BaseActionStorageWorker

from pay.bill_payments.bill_payments.core.actions.base import BaseAction, BaseAsyncDBAction
from pay.bill_payments.bill_payments.core.actions.bill.search import SearchFinesAction
from pay.bill_payments.bill_payments.core.actions.notify_user_new_bill import NotifyUserNewBillAction
from pay.bill_payments.bill_payments.core.actions.transaction.sync_status import SyncTransactionStatusAction
from pay.bill_payments.bill_payments.storage.entities.enums import TaskType, WorkerType
from pay.bill_payments.bill_payments.storage.entities.task import Task
from pay.bill_payments.bill_payments.taskq.workers.base import BaseWorker


class ActionWorker(BaseWorker, BaseActionStorageWorker):
    task_type = TaskType.RUN_ACTION
    worker_type = WorkerType.RUN_ACTION
    actions: ClassVar[Tuple[Type[BaseAsyncDBAction], ...]] = (
        SearchFinesAction,
        SyncTransactionStatusAction,
        NotifyUserNewBillAction,
    )
    retry_exceptions = True
    suppress_exceptions: ClassVar[Tuple[Type[Exception], ...]] = ()

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

    async def process_action(self, action_cls: Any, params: Any) -> None:
        await super().process_action(action_cls, params)
