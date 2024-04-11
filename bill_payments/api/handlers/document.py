from sendr_aiohttp.handler import request_schema, response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.handlers.mixins.tvm import TvmCheckMixin
from pay.bill_payments.bill_payments.api.schemas.document import (
    DocumentIDSchema,
    DocumentResponseSchema,
    SuccessResponseSchema,
    UpdateDocumentSchema,
)
from pay.bill_payments.bill_payments.core.actions.document.delete import DeleteDocumentAction
from pay.bill_payments.bill_payments.core.actions.document.update import UpdateDocumentAction


class DocumentHandler(TvmCheckMixin, BaseHandler):
    @request_schema(DocumentIDSchema(), location='match_info')
    @request_schema(UpdateDocumentSchema(), location='json')
    @response_schema(DocumentResponseSchema())
    async def put(self):
        """
        Обновляет документ.

        Ошибки:
        * DOCUMENT_NOT_FOUND
        """
        data = await self.get_data()
        data['user'] = self.user
        response = await self.run_action(UpdateDocumentAction, **data)
        return self.make_response({'data': {'document': response}})

    @request_schema(DocumentIDSchema(), location='match_info')
    @response_schema(SuccessResponseSchema())
    async def delete(self):
        """
        Удаляет документ.
        """
        data = await self.get_data()
        data['user'] = self.user
        await self.run_action(DeleteDocumentAction, **data)
        return self.make_response({'data': {}})
