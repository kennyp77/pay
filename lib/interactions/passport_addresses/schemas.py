from marshmallow import fields
from marshmallow_enum import EnumField

from pay.lib.interactions.passport_addresses.entities import Address, Contact, Location, Service
from pay.lib.schemas.base import BaseDataClassSchema


class LocationSchema(BaseDataClassSchema[Location]):
    latitude = fields.Float()
    longitude = fields.Float()


class AddressSchema(BaseDataClassSchema[Address]):
    id = fields.String()
    country = fields.String()
    locality = fields.String()
    building = fields.String()
    address_line = fields.String(allow_none=True)
    street = fields.String(allow_none=True)
    region = fields.String(allow_none=True)
    district = fields.String(allow_none=True)
    room = fields.String(allow_none=True)
    entrance = fields.String(allow_none=True)
    floor = fields.String(allow_none=True)
    intercom = fields.String(allow_none=True)
    comment = fields.String(allow_none=True)
    zip = fields.String(allow_none=True)
    location = fields.Nested(LocationSchema, allow_none=True)
    owner_service = EnumField(Service, by_value=True)
    type = fields.String(allow_none=True)
    locale = fields.String(allow_none=True)


class ContactSchema(BaseDataClassSchema[Contact]):
    id = fields.String()
    first_name = fields.String(allow_none=True)
    second_name = fields.String(allow_none=True)
    last_name = fields.String(allow_none=True)
    email = fields.String(allow_none=True)
    phone_number = fields.String(allow_none=True)
    owner_service = EnumField(Service, by_value=True)
