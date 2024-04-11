from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper
from sendr_aiopg.query_builder import CRUDQueries

from pay.sprint.sprint.storage.db.tables import users as t_users
from pay.sprint.sprint.storage.entities.user import User
from pay.sprint.sprint.storage.exceptions import UserNotFound
from pay.sprint.sprint.storage.mappers.base import BaseMapper


class UserDataMapper(SelectableDataMapper):
    entity_class = User
    selectable = t_users


class UserDataDumper(TableDataDumper):
    entity_class = User
    table = t_users


class UserMapper(BaseMapper):
    name = 'user'
    _builder = CRUDQueries(
        base=t_users,
        id_fields=('uid',),
        mapper_cls=UserDataMapper,
        dumper_cls=UserDataDumper,
    )

    async def create(self, user: User) -> User:
        query, mapper = self._builder.insert(user)
        return mapper(await self._query_one(query))

    async def get(self, uid: int) -> User:
        query, mapper = self._builder.select(id_values=(uid,))
        return mapper(await self._query_one(query, raise_=UserNotFound))
