from dataclasses import dataclass
from datetime import datetime
from typing import Any, Mapping, Optional, Protocol

from sendr_aiopg import Entity as BaseEntity
from sendr_aiopg import EntityProtocol as BaseEntityProtocol

FIELD_METADATA_AUTOGENERATE_UUID = 'pay.yandex.ru:autogenerate-uuid'


def autogenerate_uuid() -> Mapping[str, Any]:
    return {
        FIELD_METADATA_AUTOGENERATE_UUID: True,
    }


class EntityProtocol(BaseEntityProtocol, Protocol):
    """
    Протокол для обобщения полей хранимых сущностей
    """

    created: Optional[datetime]
    updated: Optional[datetime]


@dataclass
class Entity(BaseEntity):
    pass
