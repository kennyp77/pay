from datetime import datetime
from typing import Optional, Union


def normalize_datetime(value: Optional[Union[datetime, str]]) -> Optional[datetime]:
    if value is None:
        return value

    if isinstance(value, str):
        value = datetime.fromisoformat(value)

    assert value.tzinfo is not None, 'Naive timestamps are not acceptable'
    return value
