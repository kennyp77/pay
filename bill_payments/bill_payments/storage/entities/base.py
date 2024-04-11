from dataclasses import dataclass
from datetime import datetime
from typing import Any, ClassVar, Mapping, Optional, Protocol, Type

from sendr_aiopg.storage.entity import Entity as BaseEntity
from sendr_aiopg.storage.entity import EntityMeta as BaseEntityMeta
from sendr_aiopg.storage.entity import EntityProtocol as BaseEntityProtocol

from pay.bill_payments.bill_payments.storage.exceptions import StorageAlreadyExists

FIELD_METADATA_AUTOGENERATE_UUID = 'x_ya_autogenerate_uuid'


def autogenerate_uuid() -> Mapping[str, Any]:
    return {
        FIELD_METADATA_AUTOGENERATE_UUID: True,
    }


class EntityMeta(BaseEntityMeta):
    def __new__(mcs, name, bases, dct):
        new_cls = super().__new__(mcs, name, bases, dct)
        new_cls.AlreadyExists = type(f'{name}.AlreadyExists', (StorageAlreadyExists,), {})
        return new_cls


class EntityProtocol(BaseEntityProtocol, Protocol):
    """
    Протокол для обобщения полей хранимых сущностей
    """

    created: Optional[datetime]
    updated: Optional[datetime]
    AlreadyExists: ClassVar[Type[Exception]]


@dataclass
class Entity(BaseEntity, metaclass=EntityMeta):
    AlreadyExists: ClassVar[Type[Exception]]
