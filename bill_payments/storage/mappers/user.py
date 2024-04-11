from sqlalchemy import update

from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper
from sendr_aiopg.query_builder import CRUDQueries

from pay.bill_payments.bill_payments.storage.db.tables import users as t_users
from pay.bill_payments.bill_payments.storage.entities.user import User
from pay.bill_payments.bill_payments.storage.mappers.base import BaseMapperCRUD


class UserDataMapper(SelectableDataMapper):
    entity_class = User
    selectable = t_users


class UserDataDumper(TableDataDumper):
    entity_class = User
    table = t_users


class UserMapper(BaseMapperCRUD[User]):
    model = User

    _builder = CRUDQueries(
        base=t_users,
        id_fields=('uid',),
        mapper_cls=UserDataMapper,
        dumper_cls=UserDataDumper,
    )

    async def increment_revision(self, uid: int) -> int:
        query = (
            update(t_users)
            .where(t_users.c.uid == uid)
            .values(revision=t_users.c.revision + 1)
            .returning(t_users.c.revision)
        )

        return await self._query_scalar(query, raise_=self.model.DoesNotExist)

    async def update_synced_revision(self, uid: int, revision: int) -> None:
        query = (
            update(t_users)
            .where(t_users.c.uid == uid)
            .where(t_users.c.syncing_revision == revision)
            .values(syncing_revision=None, synced_revision=revision)  # consistency validation
            .returning(t_users.c.revision)
        )

        await self._query_one(query, raise_=self.model.DoesNotExist)
