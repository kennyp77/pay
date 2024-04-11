from typing import List
from uuid import UUID

from sendr_aiopg.data_mapper import SelectableDataMapper, TableDataDumper
from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.bill_payments.bill_payments.storage.db.tables import documents as t_documents
from pay.bill_payments.bill_payments.storage.entities.document import Document
from pay.bill_payments.bill_payments.storage.mappers.base import BaseMapperCRUD


class DocumentDataMapper(SelectableDataMapper):
    entity_class = Document
    selectable = t_documents


class DocumentDataDumper(TableDataDumper):
    entity_class = Document
    table = t_documents


class DocumentMapper(BaseMapperCRUD[Document]):
    model = Document

    _builder = CRUDQueries(
        base=t_documents,
        id_fields=('document_id',),
        mapper_cls=DocumentDataMapper,
        dumper_cls=DocumentDataDumper,
    )

    async def find_by_uid(self, uid: int) -> List[Document]:
        return await alist(self.find(filters={'uid': uid}))

    async def get_by_uid_and_document_id(self, uid: int, document_id: UUID) -> Document:
        return await self.find_ensure_one(filters={'uid': uid, 'document_id': document_id}, limit=1)
