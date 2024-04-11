from sendr_taskqueue.worker.storage.arbiter import BaseStorageArbiterWorker

from pay.sprint.sprint.conf import settings
from pay.sprint.sprint.storage import StorageContext


class ArbiterWorker(BaseStorageArbiterWorker):
    CHECK_WORKERS_ACTIVE = True
    KILL_ON_CLEANUP = True

    storage_context_cls = StorageContext
    worker_heartbeat_period = settings.TASKQ_WORKER_HEARTBEAT_PERIOD
