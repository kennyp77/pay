from uuid import UUID

from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper
from sendr_aiopg.query_builder import CRUDQueries

from pay.bill_payments.bill_payments.storage.db.tables import orders as t_orders
from pay.bill_payments.bill_payments.storage.entities.order import Order
from pay.bill_payments.bill_payments.storage.mappers.base import BaseMapperCRUD


class OrderDataMapper(SelectableDataMapper):
    entity_class = Order
    selectable = t_orders


class OrderDataDumper(TableDataDumper):
    entity_class = Order
    table = t_orders


class OrderMapper(BaseMapperCRUD[Order]):
    model = Order

    _builder = CRUDQueries(
        base=t_orders,
        id_fields=('order_id',),
        mapper_cls=OrderDataMapper,
        dumper_cls=OrderDataDumper,
    )

    async def get_by_order_id_and_uid(self, order_id: UUID, uid: int, for_update: bool = False) -> Order:
        return await self.find_ensure_one(filters={'order_id': order_id, 'uid': uid}, for_update=for_update)
