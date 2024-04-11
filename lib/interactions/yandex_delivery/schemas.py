from marshmallow_dataclass import class_schema

from sendr_utils.schemas.base import BaseSchema as BSchema

from pay.lib.interactions.yandex_delivery.entities import (
    AcceptClaimResponse,
    CancelClaimResponse,
    CheckPriceRequest,
    CheckPriceResponse,
    Claim,
    CreateClaimRequest,
    GetDeliveryMethodsResponse,
)


class BaseSchema(BSchema):
    SKIP_NONE = True


GetDeliveryMethodsResponseSchema = class_schema(GetDeliveryMethodsResponse, base_schema=BaseSchema)
AcceptClaimResponseSchema = class_schema(AcceptClaimResponse, base_schema=BaseSchema)
CancelClaimResponseSchema = class_schema(CancelClaimResponse, base_schema=BaseSchema)
CheckPriceRequestSchema = class_schema(CheckPriceRequest, base_schema=BaseSchema)
CheckPriceResponseSchema = class_schema(CheckPriceResponse, base_schema=BaseSchema)
CreateClaimRequestSchema = class_schema(CreateClaimRequest, base_schema=BaseSchema)
ClaimSchema = class_schema(Claim, base_schema=BaseSchema)
