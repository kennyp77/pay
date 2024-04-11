from marshmallow import fields

from pay.sprint.sprint.api.schemas.base import BaseSchema


class UserUIDSchema(BaseSchema):
    uid = fields.Integer(required=True)


class UserSchema(BaseSchema):
    uid = fields.Integer()
    login = fields.String()


user_uid_schema = UserUIDSchema()
user_schema = UserSchema()
