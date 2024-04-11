from sendr_taskqueue.worker.storage import get_worker_mapper

from pay.bill_payments.bill_payments.storage.db.tables import metadata
from pay.bill_payments.bill_payments.storage.entities.enums import WorkerType

WorkerMapper = get_worker_mapper(
    metadata=metadata,
    worker_type_cls=WorkerType,
)
