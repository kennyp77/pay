from typing import List, Mapping
from uuid import UUID

from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper
from sendr_aiopg.query_builder import CRUDQueries, RelationDescription
from sendr_aiopg.types import ValuesMapping

from pay.bill_payments.bill_payments.storage.db.tables import bill_orders as t_bill_orders
from pay.bill_payments.bill_payments.storage.db.tables import bills as t_bills
from pay.bill_payments.bill_payments.storage.entities.bill_order import BillOrder
from pay.bill_payments.bill_payments.storage.mappers.base import BaseMapperCRUD
from pay.bill_payments.bill_payments.storage.mappers.bill import BillDataMapper


class BillOrderDataMapper(SelectableDataMapper):
    entity_class = BillOrder
    selectable = t_bill_orders


class BillOrderDataDumper(TableDataDumper):
    entity_class = BillOrder
    table = t_bill_orders


class BillOrderMapper(BaseMapperCRUD[BillOrder]):
    model = BillOrder

    related_bill = RelationDescription(
        name='bill',
        base=t_bill_orders,
        related=t_bills,
        base_cols=('bill_id',),  # колонки ForeignKey базового объекта
        related_cols=('bill_id',),  # колонки ForeignKey присоединяемого объекта
        mapper_cls=BillDataMapper,  # маппер присоединяемого объекта
    )

    _builder = CRUDQueries(
        base=t_bill_orders,
        id_fields=('bill_id', 'order_id'),
        mapper_cls=BillOrderDataMapper,
        dumper_cls=BillOrderDataDumper,
    )

    def _get_builder(self, include_bill: bool = False) -> CRUDQueries:
        builder = self._builder
        if include_bill:
            builder = builder.with_related(self.related_bill)
        return builder

    @staticmethod
    def _map_related(
        row: ValuesMapping,
        mapper: SelectableDataMapper,
        rel_mappers: Mapping[str, SelectableDataMapper],
    ) -> BillOrder:
        bill_order: BillOrder = mapper(row)
        if 'bill' in rel_mappers:
            bill_order.bill = rel_mappers['bill'](row)
        return bill_order

    async def find_by_order_id(
        self, order_id: UUID, for_update: bool = False, include_bill: bool = False
    ) -> List[BillOrder]:
        builder = self._get_builder(include_bill=include_bill)
        query, mapper, rel_mappers = builder.select_related(filters=dict(order_id=order_id), for_update=for_update)
        return [self._map_related(row, mapper, rel_mappers) async for row in self._query(query)]
