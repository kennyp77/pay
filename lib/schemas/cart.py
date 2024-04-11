import marshmallow_dataclass

from sendr_utils.schemas import CamelCaseSchema

from pay.lib.entities.cart import Cart

CartSchema = marshmallow_dataclass.class_schema(Cart, base_schema=CamelCaseSchema)
