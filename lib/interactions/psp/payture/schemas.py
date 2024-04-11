import ipaddress

import marshmallow_dataclass
from marshmallow import fields
from marshmallow_enum import EnumField

from sendr_utils.schemas.base import BaseSchema
from sendr_utils.schemas.camel_case import CamelCaseSchema as BaseCamelCaseSchema
from sendr_utils.schemas.dataclass import BaseDataClassSchema
from sendr_utils.schemas.one_of_schema import OneOfSchema

from pay.lib.entities.threeds import ThreeDSBrowserData
from pay.lib.interactions.psp.payture.entities import (
    AddInfo,
    Block3DSV1Required,
    Block3DSV2Required,
    BlockSuccess,
    ChargeResult,
    Cheque,
    Order,
    OrderState,
    RefundResult,
    SuccessStatus,
    UnblockResult,
)


class CamelCaseSchema(BaseCamelCaseSchema):
    CAPITAL_FIRST_LETTER = True


AddInfoSchema = marshmallow_dataclass.class_schema(AddInfo, base_schema=CamelCaseSchema)
BlockSuccessSchema = marshmallow_dataclass.class_schema(BlockSuccess, base_schema=CamelCaseSchema)
ChequeSchema = marshmallow_dataclass.class_schema(Cheque, base_schema=CamelCaseSchema)


class Block3DSV1RequiredSchema(BaseDataClassSchema[Block3DSV1Required]):
    acs_url = fields.String(load_from='ACSUrl')
    pa_req = fields.String(load_from='PaReq')
    three_ds_key = fields.String(load_from='ThreeDSKey')


class Block3DSV2RequiredSchema(BaseDataClassSchema[Block3DSV2Required]):
    acs_url = fields.String(load_from='ACSUrl')
    creq = fields.String(load_from='CReq')
    threeds_session_data = fields.String(load_from='ThreeDSSessionData')


class Block3DSRequiredSchema(OneOfSchema):
    type_field = 'ThreeDSVersion'
    type_schemas = {
        '1.0': Block3DSV1RequiredSchema,
        '2.1': Block3DSV2RequiredSchema,
    }


class BlockResultSchema(OneOfSchema):
    type_field = 'Success'
    type_schemas = {
        SuccessStatus.SUCCESS.value: BlockSuccessSchema,
        SuccessStatus.THREEDS.value: Block3DSRequiredSchema,
    }


class ChargeResultSchema(BaseDataClassSchema[ChargeResult]):
    raw_new_amount = fields.Integer(load_from='Amount')


class RefundResultSchema(BaseDataClassSchema[RefundResult]):
    raw_new_amount = fields.Integer(load_from='NewAmount')


class UnblockResultSchema(BaseDataClassSchema[UnblockResult]):
    raw_new_amount = fields.Integer(load_from='NewAmount')


class OrderSchema(BaseDataClassSchema[Order]):
    order_id = fields.String(load_from='OrderId')
    state = EnumField(OrderState, by_value=True, load_from='State')
    raw_amount = fields.Integer(load_from='Amount')
    rrn = fields.String(load_from='RRN')
    add_info = fields.Nested(AddInfoSchema, load_from='AddInfo')


class BrowserDataSchema(BaseSchema):
    accept_header = fields.String(dump_to='AcceptHeader')
    screen_color_depth = fields.Method('dump_screen_color_depth', dump_to='ColorDepth')
    ip = fields.Method('dump_ip', dump_to='Ip')
    language = fields.Method('dump_language', dump_to='Language')
    screen_height = fields.Integer(dump_to='ScreenHeight')
    screen_width = fields.Integer(dump_to='ScreenWidth')
    window_height = fields.Integer(dump_to='WindowHeight')
    window_width = fields.Integer(dump_to='WindowWidth')
    timezone = fields.String(dump_to='Timezone')
    user_agent = fields.String(dump_to='UserAgent')
    java_enabled = fields.Boolean(dump_to='JavaEnabled')

    def dump_ip(self, browser_data: ThreeDSBrowserData) -> str:
        return ipaddress.ip_address(browser_data.ip).exploded

    def dump_language(self, browser_data: ThreeDSBrowserData) -> str:
        language = browser_data.language.upper()
        if language[:2] == 'RU' and language[:3] != 'RUN':
            return 'RU'
        return 'EN'

    def dump_screen_color_depth(self, browser_data: ThreeDSBrowserData) -> str:
        color_map = {
            1: 'ONE_BIT',
            4: 'FOUR_BITS',
            8: 'EIGHT_BITS',
            15: 'FIFTEEN_BITS',
            16: 'SIXTEEN_BITS',
            24: 'TWENTY_FOUR_BITS',
            32: 'THIRTY_TWO_BITS',
            48: 'FORTY_EIGHT_BITS',
        }
        rounded = browser_data.map_screen_color_depth_to_supported(supported=list(color_map.keys()))
        return color_map[rounded]
