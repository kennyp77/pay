from typing import Any, Dict, List, cast
from uuid import UUID

from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper
from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.bill_payments.bill_payments.storage.db.tables import transactions as t_transactions
from pay.bill_payments.bill_payments.storage.entities.transaction import PayerData, Transaction
from pay.bill_payments.bill_payments.storage.mappers.base import BaseMapperCRUD


class TransactionDataMapper(SelectableDataMapper):
    entity_class = Transaction
    selectable = t_transactions

    def map_payer_data(self, data: Dict[str, Any]) -> PayerData:
        return cast(
            PayerData,
            PayerData.from_jsonb(data),
        )


class TransactionDataDumper(TableDataDumper):
    entity_class = Transaction
    table = t_transactions

    def dump_payer_data(self, data: PayerData) -> Dict[str, Any]:
        return data.to_jsonb()


class TransactionMapper(BaseMapperCRUD[Transaction]):
    model = Transaction

    _builder = CRUDQueries(
        base=t_transactions,
        id_fields=('transaction_id',),
        mapper_cls=TransactionDataMapper,
        dumper_cls=TransactionDataDumper,
    )

    async def find_by_order_id(self, order_id: UUID, for_update: bool = False) -> List[Transaction]:
        return await alist(self.find(filters={'order_id': order_id}, for_update=for_update))
