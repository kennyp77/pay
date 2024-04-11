from typing import List

from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper
from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.bill_payments.bill_payments.interactions.kazna.entities import DepartmentType
from pay.bill_payments.bill_payments.storage.db.tables import bills as t_bills
from pay.bill_payments.bill_payments.storage.entities.bill import Bill
from pay.bill_payments.bill_payments.storage.entities.enums import BillStatus
from pay.bill_payments.bill_payments.storage.mappers.base import BaseMapperCRUD


class BillDataMapper(SelectableDataMapper):
    entity_class = Bill
    selectable = t_bills


class BillDataDumper(TableDataDumper):
    entity_class = Bill
    table = t_bills

    def dump_dep_type(self, dep_type: DepartmentType) -> DepartmentType:
        """
        Хочу, чтобы в качестве значения, сохраняемого в базу, использовался не Enum.value,
        а Enum.name.
        Проблема в том, что стандартная реализация dumper'а зачем-то извлекает значение из enum'а:
        ```
        if isinstance(value, Enum):
            return value.value
        ```
        Поэтому приходится переопределить dumper для поля dep_type, чтобы он не извлекал Enum.value
        """
        return dep_type


class BillMapper(BaseMapperCRUD[Bill]):
    model = Bill

    _builder = CRUDQueries(
        base=t_bills,
        id_fields=('bill_id',),
        mapper_cls=BillDataMapper,
        dumper_cls=BillDataDumper,
    )

    async def find_by_uid(self, uid: int, for_update: bool = False) -> List[Bill]:
        return await alist(self.find(filters={'uid': uid}, for_update=for_update))

    async def find_latest_unpaid_by_uid(self, uid: int, limit: int = 200) -> List[Bill]:
        query, mapper = self._builder.select(filters={'uid': uid, 'status': BillStatus.NEW})
        query = query.order_by(t_bills.c.bill_date.desc()).limit(limit)
        found: List[Bill] = []
        async for row in self._query(query):
            found.append(mapper(row))
        return found
