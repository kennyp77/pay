from marshmallow import fields

from sendr_utils.schemas.base import BaseSchema


class BaseResponseSchema(BaseSchema):
    code = fields.Integer()
    status = fields.String()
    data = fields.Dict(default=None)


class SuccessResponseSchema(BaseResponseSchema):
    code = fields.Integer(default=200)
    status = fields.Constant('success')


class FailDataSchema(BaseSchema):
    message = fields.String()
    params = fields.Dict()


class FailResponseSchema(BaseResponseSchema):
    code = fields.Integer()
    status = fields.Constant('fail')
    data = fields.Nested(FailDataSchema)


fail_response_schema = FailResponseSchema()
