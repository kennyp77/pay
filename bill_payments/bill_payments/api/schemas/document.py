from marshmallow import fields, validate
from marshmallow_enum import EnumField

from pay.bill_payments.bill_payments.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.bill_payments.bill_payments.interactions.kazna.entities import DocumentCode


class DocumentIDSchema(BaseSchema):
    document_id = fields.UUID(required=True)


class DocumentSchema(BaseSchema):
    document_id = fields.UUID()
    code = EnumField(DocumentCode, by_value=False, required=True, load_from='type', dump_to='type')
    value = fields.String(
        required=True, validate=validate.Regexp(r'(\d[1-9]|[1-9]\d)([А-Яа-я]{2}|\d{2})\d{6}')
    )  # TODO: different validation by document type
    title = fields.String()
    created = fields.DateTime()
    updated = fields.DateTime()


class CreateDocumentRequestSchema(DocumentSchema):
    class Meta(DocumentSchema.Meta):  # type: ignore
        exclude = ('document_id', 'created', 'updated')


class UpdateDocumentSchema(DocumentSchema):
    class Meta(DocumentSchema.Meta):  # type: ignore
        exclude = ('document_id', 'created', 'updated')


class DocumentDataResponseSchema(BaseSchema):
    document = fields.Nested(DocumentSchema)


class DocumentResponseSchema(SuccessResponseSchema):
    data = fields.Nested(DocumentDataResponseSchema)


class MultipleDocumentsDataSchema(BaseSchema):
    documents = fields.Nested(DocumentSchema, many=True)


class MultipleDocumentsResponseSchema(SuccessResponseSchema):
    data = fields.Nested(MultipleDocumentsDataSchema)
