import abc
import uuid
from dataclasses import fields
from typing import Any, Iterable, Optional, TypeVar

from sqlalchemy import func

from sendr_aiopg import BaseMapperCRUD as BMapperCRUD
from sendr_aiopg.storage import BaseMapper as BMapper
from sendr_utils import alist

from pay.sprint.sprint.storage.entities.base import FIELD_METADATA_AUTOGENERATE_UUID, EntityProtocol


class BaseMapper(BMapper, metaclass=abc.ABCMeta):
    def generate_uuid(self) -> uuid.UUID:
        return uuid.uuid4()


EntityType = TypeVar('EntityType', bound=EntityProtocol)


class BaseMapperCRUD(BaseMapper, BMapperCRUD[EntityType]):
    async def create(self, entity: EntityType, *args: Any, **kwargs: Any) -> EntityType:  # type: ignore
        if args or kwargs:
            raise TypeError('create takes at most 1 argument')

        supplied_ids = []
        for field in fields(entity):
            if field.name in self._builder.id_fields:
                if field.metadata.get(FIELD_METADATA_AUTOGENERATE_UUID, False) and getattr(entity, field.name) is None:
                    setattr(entity, field.name, self.generate_uuid())
                if getattr(entity, field.name) is not None:
                    supplied_ids.append(field.name)

        omitted_ids = set(self._builder.id_fields) - set(supplied_ids)
        ignore_fields = ('created', 'updated', *omitted_ids)
        return await super().create(entity, ignore_fields=ignore_fields)

    async def save(self, entity: EntityType, ignore_fields: Optional[Iterable[str]] = None) -> EntityType:
        if ignore_fields is None:
            ignore_fields = []

        entity.updated = func.now()
        return await super().save(entity, ignore_fields=('created', *self._builder.id_fields, *ignore_fields))

    async def find_ensure_one(self, **kwargs: Any) -> EntityType:
        result = await alist(self.find(**kwargs))

        assert len(result) <= 1
        if not result:
            raise self.model.DoesNotExist

        return result[0]
