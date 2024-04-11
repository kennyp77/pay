from sendr_taskqueue.worker.storage import get_worker_mapper

from pay.sprint.sprint.storage.db.tables import metadata
from pay.sprint.sprint.storage.entities.enums import WorkerType

WorkerMapper = get_worker_mapper(
    metadata=metadata,
    worker_type_cls=WorkerType,
)
