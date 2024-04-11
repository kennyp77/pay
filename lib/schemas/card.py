import marshmallow_dataclass

from pay.lib.entities.card import Card
from pay.lib.schemas.base import BaseSchema

CardSchema = marshmallow_dataclass.class_schema(Card, base_schema=BaseSchema)
