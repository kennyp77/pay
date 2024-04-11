import ipaddress

import marshmallow_dataclass
from marshmallow import fields

from sendr_utils.schemas.base import BaseSchema as BSchema
from sendr_utils.schemas.one_of_schema import OneOfSchema

from pay.lib.entities.threeds import ThreeDSBrowserData
from pay.lib.interactions.psp.uniteller.entities import (
    ChargeResult,
    Cheque,
    RefundResult,
    Result,
    ThreeDSV1Result,
    ThreeDSV2Result,
)


class BaseSchema(BSchema):
    SKIP_NONE = True


ResultSchema = marshmallow_dataclass.class_schema(Result, base_schema=BaseSchema)

ChargeSuccessSchema = marshmallow_dataclass.class_schema(ChargeResult, base_schema=BaseSchema)

Charge3DSV1RequiredSchema = marshmallow_dataclass.class_schema(ThreeDSV1Result, base_schema=BaseSchema)

Charge3DSV2RequiredSchema = marshmallow_dataclass.class_schema(ThreeDSV2Result, base_schema=BaseSchema)

RefundResultSchema = marshmallow_dataclass.class_schema(RefundResult, base_schema=BaseSchema)

ChequeSchema = marshmallow_dataclass.class_schema(Cheque, base_schema=BaseSchema)


class Charge3DSRequiredSchema(OneOfSchema):
    type_field = 'version_3ds'
    type_schemas = {
        '1': Charge3DSV1RequiredSchema,
        '2': Charge3DSV2RequiredSchema,
    }


class ChargeResultSchema(OneOfSchema):
    type_field = 'is_3ds'
    type_schemas = {
        '0': ChargeSuccessSchema,
        '1': Charge3DSRequiredSchema,
    }


class BrowserDataSchema(BaseSchema):
    accept_header = fields.String(dump_to='accept')
    screen_color_depth = fields.Integer(dump_to='colorDepth')
    language = fields.String(dump_to='language')
    screen_height = fields.Integer(dump_to='screenHeight')
    screen_width = fields.Integer(dump_to='screenWidth')
    window_height = fields.Integer(dump_to='windowHeight')
    window_width = fields.Integer(dump_to='windowWidth')
    timezone = fields.Integer(dump_to='timezoneOffset')
    user_agent = fields.String(dump_to='userAgent')
    java_enabled = fields.Boolean(dump_to='javaEnabled')

    def dump_ip(self, browser_data: ThreeDSBrowserData) -> str:
        return ipaddress.ip_address(browser_data.ip).exploded
