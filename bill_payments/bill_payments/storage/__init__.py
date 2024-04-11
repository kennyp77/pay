from sendr_aiopg import StorageAnnotatedMeta, StorageBase, StorageContextBase

from pay.bill_payments.bill_payments.storage.mappers.bill import BillMapper
from pay.bill_payments.bill_payments.storage.mappers.bill_order import BillOrderMapper
from pay.bill_payments.bill_payments.storage.mappers.document import DocumentMapper
from pay.bill_payments.bill_payments.storage.mappers.order import OrderMapper
from pay.bill_payments.bill_payments.storage.mappers.task import TaskMapper
from pay.bill_payments.bill_payments.storage.mappers.transaction import TransactionMapper
from pay.bill_payments.bill_payments.storage.mappers.user import UserMapper
from pay.bill_payments.bill_payments.storage.mappers.worker import WorkerMapper


class Storage(StorageBase, metaclass=StorageAnnotatedMeta):
    bill: BillMapper
    bill_order: BillOrderMapper
    document: DocumentMapper
    order: OrderMapper
    user: UserMapper
    task: TaskMapper
    transaction: TransactionMapper
    worker: WorkerMapper


class StorageContext(StorageContextBase):
    STORAGE_CLS = Storage
