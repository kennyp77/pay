from typing import Optional

from aiopg.sa.engine import Engine

from sendr_core.context import BaseCoreContext

from pay.sprint.sprint.storage import Storage


class CoreContext(BaseCoreContext):
    db_engine: Engine
    storage: Optional[Storage] = None
