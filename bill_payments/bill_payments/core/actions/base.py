from typing import ClassVar, Optional, Tuple, Type, cast

from sendr_aiopg.action import BaseDBAction as BDBAction
from sendr_aiopg.engine.lazy import LazyEngine
from sendr_core.action import BaseAction as BAction
from sendr_core.exceptions import BaseCoreError
from sendr_qlog import LoggerContext
from sendr_taskqueue import BaseAsyncDBAction as BAsyncDBAction

from pay.bill_payments.bill_payments.core.context import CoreContext
from pay.bill_payments.bill_payments.interactions import InteractionClients
from pay.bill_payments.bill_payments.storage import Storage, StorageContext
from pay.bill_payments.bill_payments.storage.entities.enums import TaskType
from pay.bill_payments.bill_payments.storage.entities.task import Task
from pay.bill_payments.bill_payments.utils.logging import BillPaymentsLoggerContext


class BaseAction(BAction[CoreContext]):
    context = CoreContext()
    non_retryable_errors: ClassVar[Tuple[Type[BaseCoreError], ...]] = ()
    retryable_errors: ClassVar[Tuple[Type[BaseCoreError], ...]] = ()

    def __init__(self):
        super().__init__()
        self._clients = InteractionClients(self.logger, self.request_id)

    @property
    def logger(self) -> BillPaymentsLoggerContext:
        return cast(BillPaymentsLoggerContext, self.context.logger)

    @property
    def product_logger(self) -> BillPaymentsLoggerContext:
        return self.logger.with_product_log()

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

    @classmethod
    def setup_context(
        cls,
        *,
        logger: LoggerContext,
        request_id: str,
        db_engine: LazyEngine,
    ) -> None:
        cls.context.logger = logger
        cls.context.request_id = request_id
        cls.context.db_engine = db_engine


class BaseDBAction(BDBAction[Storage], BaseAction):
    storage_context_cls = StorageContext


class BaseAsyncDBAction(BAsyncDBAction, BaseAction):
    storage_context_cls = StorageContext
    task_type = TaskType.RUN_ACTION

    @classmethod
    async def report_task_failure(cls, task: Task, reason: Optional[str]) -> None:
        pass
