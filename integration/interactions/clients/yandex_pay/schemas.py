from marshmallow import fields
from billing.yandex_pay_plus.yandex_pay_plus.api.schemas.merchant.operation import (
    OperationSchema as BaseOperationSchema,
)
from billing.yandex_pay_plus.yandex_pay_plus.api.schemas.base import CamelCaseSchema, SuccessResponseSchema


# Вообще, это не очень хорошо, что схема Operation в коде yandex pay plus пригодна для сериализации,
# но непригодна для десериализации
class OperationSchema(BaseOperationSchema):
    class Meta(BaseOperationSchema.Meta):  # type: ignore
        fields = BaseOperationSchema.Meta.fields + (
            'merchant_id',
            'checkout_order_id',
        )

    merchant_id = fields.Raw(missing=None)
    checkout_order_id = fields.Raw(missing=None)


class OperationResponseDataSchema(CamelCaseSchema):
    operation = fields.Nested(OperationSchema)


class OperationResponseSchema(SuccessResponseSchema):
    data = fields.Nested(OperationResponseDataSchema)
