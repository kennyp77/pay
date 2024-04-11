from typing import Optional

from aiopg.sa.engine import Engine

from sendr_core.context import BaseCoreContext

from pay.bill_payments.bill_payments.storage import Storage


class CoreContext(BaseCoreContext):
    db_engine: Engine
    storage: Optional[Storage] = None
