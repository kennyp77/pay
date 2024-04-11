from sendr_taskqueue.worker.storage.arbiter import BaseStorageArbiterWorker

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.storage import StorageContext


class ArbiterWorker(BaseStorageArbiterWorker):
    CHECK_WORKERS_ACTIVE = True
    KILL_ON_CLEANUP = True

    storage_context_cls = StorageContext
    worker_heartbeat_period = settings.TASKQ_WORKER_HEARTBEAT_PERIOD
