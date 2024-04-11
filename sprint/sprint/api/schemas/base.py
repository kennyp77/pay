from marshmallow import fields

from sendr_utils.schemas.base import BaseSchema as BSchema


class BaseSchema(BSchema):
    pass


class BaseResponseSchema(BaseSchema):
    code = fields.Integer()
    status = fields.String()
    data = fields.Dict(default=None)


class SuccessResponseSchema(BaseResponseSchema):
    code = fields.Constant(200)
    status = fields.Constant('success')


class FailDataSchema(BaseSchema):
    message = fields.String()
    params = fields.Dict()


class FailResponseSchema(BaseResponseSchema):
    code = fields.Integer()
    status = fields.Constant('fail')
    data = fields.Nested(FailDataSchema)


success_response_schema = SuccessResponseSchema()
fail_response_schema = FailResponseSchema()
