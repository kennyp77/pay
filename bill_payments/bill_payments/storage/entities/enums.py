from enum import Enum, unique

from sendr_taskqueue import BaseTaskType


@unique
class TaskType(BaseTaskType):
    RUN_ACTION = 'run_action'


@unique
class WorkerType(Enum):
    RUN_ACTION = 'run_action'


@unique
class BillStatus(Enum):
    NEW = 'new'
    PAID = 'paid'
    GONE = 'gone'


@unique
class OrderStatus(Enum):
    NEW = 'new'
    PAID = 'paid'


@unique
class TransactionStatus(Enum):
    NEW = 'new'
    PAID = 'paid'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'


@unique
class PaymentMethodType(Enum):
    YANDEX_PAY = 'yandex_pay'
