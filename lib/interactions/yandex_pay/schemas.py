import marshmallow_dataclass

from sendr_utils.schemas.base import BaseSchema

from pay.lib.interactions.yandex_pay.entities import CreatePaymentTokenResponse

CreatePaymentTokenResponseSchema = marshmallow_dataclass.class_schema(
    CreatePaymentTokenResponse, base_schema=BaseSchema
)
