from sendr_aiohttp.handler import request_schema, response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.handlers.mixins.tvm import TvmCheckMixin
from pay.bill_payments.bill_payments.api.schemas.document import (
    CreateDocumentRequestSchema,
    DocumentResponseSchema,
    MultipleDocumentsResponseSchema,
)
from pay.bill_payments.bill_payments.core.actions.document.create import CreateDocumentAction
from pay.bill_payments.bill_payments.core.actions.document.list import ListDocumentsOfUserAction


class DocumentsHandler(TvmCheckMixin, BaseHandler):
    @response_schema(MultipleDocumentsResponseSchema())
    async def get(self):
        """
        Получает список документов.
        """
        data = await self.get_data()
        data['user'] = self.user
        response = await self.run_action(ListDocumentsOfUserAction, **data)
        return self.make_response({'data': {'documents': response}})

    @request_schema(CreateDocumentRequestSchema(), location='json')
    @response_schema(DocumentResponseSchema())
    async def post(self):
        """
        Создаёт новый документ.

        Ошибки:
        * TOO_MANY_DOCUMENTS - превышен предел количества документов.
            * params.limit - текущий предел количества документов
        """
        data = await self.get_data()
        data['user'] = self.user
        response = await self.run_action(CreateDocumentAction, **data)
        return self.make_response({'data': {'document': response}, 'code': 201}, status=201)
