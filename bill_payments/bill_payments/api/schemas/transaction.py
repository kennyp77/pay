from marshmallow import fields
from marshmallow_enum import EnumField

from sendr_utils.schemas.dataclass import BaseDataClassSchema
from sendr_utils.schemas.validators import NonEmptyString

from pay.bill_payments.bill_payments.api.schemas.base import BaseSchema, SuccessResponseSchema
from pay.bill_payments.bill_payments.core.entities.mpi_3ds_info import MPI3DSInfo
from pay.bill_payments.bill_payments.storage.entities.enums import PaymentMethodType, TransactionStatus


class MPI3DSInfoSchema(BaseDataClassSchema[MPI3DSInfo]):
    browser_accept_header = fields.String(
        required=True, description="D030. Буквальное содержимое заголовка Accept, которое браузер присылает веб-серверу"
    )
    browser_color_depth = fields.Integer(
        required=True, description="В браузере достаточно присылать window.screen.colorDepth"
    )
    browser_ip = fields.String(required=True)
    browser_language = fields.String(
        required=True, description="C005. IEFT BCP47 код. javascript:navigator.language", example="ru"
    )
    browser_screen_height = fields.Integer(required=True, description="javascript:window.screen.height")
    browser_screen_width = fields.Integer(required=True, description="javascript:window.screen.width")
    browser_tz = fields.String(
        required=True,
        description=(
            "C006. Разница между временем по UTC и текущим временем в минутах. "
            "Да, для восточного полушария - отрицательная, для западного - положительная. "
            "javascript:new Date().getTimezoneOffset()"
        ),
    )
    browser_user_agent = fields.String(required=True, description="D031. Заголовок User-Agent as is")
    browser_javascript_enabled = fields.Boolean(required=True)
    window_width = fields.Integer(required=True, description="javascript:window.innerWidth")
    window_height = fields.Integer(required=True, description="javascript:window.innerHeight")


class TransactionIDSchema(BaseSchema):
    transaction_id = fields.UUID(required=True)


class TransactionSchema(TransactionIDSchema):
    class Meta(TransactionIDSchema.Meta):  # type: ignore
        dump_only = ('transaction_id',)

    payment_method = EnumField(PaymentMethodType, required=True)
    payment_token = fields.String(required=True, validate=[NonEmptyString()])
    payer_full_name = fields.String(required=True, validate=[NonEmptyString()])
    mpi_3ds_info = fields.Nested(MPI3DSInfoSchema, required=True)
    return_url = fields.URL(required=True, schemes={'https'})

    order_id = fields.UUID(required=True, dump_only=True)
    amount = fields.Integer(required=True, dump_only=True)
    status = EnumField(TransactionStatus, required=True, dump_only=True)
    acs_url = fields.URL(dump_only=True)
    created = fields.DateTime(dump_only=True, required=True)
    updated = fields.DateTime(dump_only=True, required=True)


class OrderIDSchema(BaseSchema):
    order_id = fields.UUID(required=True)


class TransactionInfoSchema(TransactionSchema):
    class Meta(TransactionSchema.Meta):
        fields = (
            'transaction_id',
            'status',
        )


class TransactionDataResponseSchema(BaseSchema):
    transaction = fields.Nested(TransactionInfoSchema)


class TransactionResponseSchema(SuccessResponseSchema):
    data = fields.Nested(TransactionDataResponseSchema)


class CreateTransactionDataResponseSchema(BaseSchema):
    transaction = fields.Nested(TransactionSchema)


class CreateTransactionResponseSchema(SuccessResponseSchema):
    data = fields.Nested(CreateTransactionDataResponseSchema)
