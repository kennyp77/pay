from marshmallow import fields

from sendr_utils.schemas.dataclass import BaseDataClassSchema

from pay.lib.entities.threeds import ThreeDSBrowserDataHeaders, ThreeDSBrowserDataPayload


class ThreeDSBrowserDataHeadersSchema(BaseDataClassSchema[ThreeDSBrowserDataHeaders]):
    accept_header = fields.String(required=True, load_from='Accept')
    ip = fields.String(required=True, load_from='X-Forwarded-For-Y')
    user_agent = fields.String(required=True, load_from='User-Agent')


class ThreeDSBrowserDataPayloadSchema(BaseDataClassSchema[ThreeDSBrowserDataPayload]):
    java_enabled = fields.Boolean(required=True)
    language = fields.String(required=True)
    screen_color_depth = fields.Integer(required=True)
    screen_height = fields.Integer(required=True)
    screen_width = fields.Integer(required=True)
    window_height = fields.Integer(required=True)
    window_width = fields.Integer(required=True)
    timezone = fields.Integer(required=True)
