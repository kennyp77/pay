import math
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum, unique
from typing import ClassVar, List, Optional

from marshmallow import post_dump, pre_load
from marshmallow_dataclass import add_schema

from sendr_utils.schemas.base import BaseSchema

from pay.lib.entities.cart import CartItem
from pay.lib.entities.contact import Contact as CoreContact
from pay.lib.entities.shipping import Address as CoreAddress


class YandexDeliveryLocationSchema(BaseSchema):
    @post_dump
    def to_array(self, data, **kwargs):
        assert len(data.keys()) == 2
        return [data['longitude'], data['latitude']]

    @pre_load
    def from_array(self, data, **kwargs):
        assert len(data) == 2
        return {'longitude': data[0], 'latitude': data[1]}


@add_schema(base_schema=YandexDeliveryLocationSchema)
@dataclass
class Location:
    latitude: float
    longitude: float

    Schema: ClassVar[BaseSchema]


@dataclass
class Coordinates:
    coordinates: Location


@dataclass
class DeliveryInterval:
    from_: datetime = field(metadata={'load_from': 'from', 'dump_to': 'from'})
    to: datetime


@dataclass
class DeliveryMethodInfo:
    allowed: bool


@dataclass
class SameDayDeliveryMethodInfo(DeliveryMethodInfo):
    available_intervals: Optional[List[DeliveryInterval]] = None


@dataclass
class GetDeliveryMethodsResponse:
    express_delivery: DeliveryMethodInfo
    same_day_delivery: SameDayDeliveryMethodInfo


@dataclass
class ItemSize:
    length: float
    width: float
    height: float


@dataclass
class Item:
    cost_currency: str
    cost_value: str
    droppof_point: int
    pickup_point: int
    title: str
    size: ItemSize
    weight: float
    quantity: int

    @classmethod
    def from_cart_item(cls, item: CartItem) -> 'Item':
        assert item.measurements is not None
        return cls(
            quantity=math.ceil(item.quantity.count),
            weight=item.measurements.weight,
            size=ItemSize(
                length=item.measurements.length,
                width=item.measurements.width,
                height=item.measurements.height,
            ),
            cost_currency='RUB',  # TODO: 2022-07-15 @perseus нужно указать валюту, но она в корзине, а не в item-е
            cost_value=str(item.total),
            droppof_point=RoutePointId.DESTINATION.value,
            pickup_point=RoutePointId.SOURCE.value,
            title=item.title or '',
        )


@dataclass
class SameDayData:
    delivery_interval: DeliveryInterval


@dataclass
class ClientRequirements:
    same_day_data: Optional[SameDayData] = None


class RoutePointId(Enum):
    SOURCE = 0
    DESTINATION = 1


@dataclass
class CheckPriceRequest:
    items: List[Item]
    route_points: List[Coordinates]
    requirements: Optional[ClientRequirements] = None


@dataclass
class CheckPriceResponse:
    price: Decimal


@dataclass
class Contact:
    name: str
    phone: str
    email: Optional[str] = None
    phone_additional_code: Optional[str] = None

    @classmethod
    def from_core_contact(cls, contact: CoreContact) -> 'Contact':
        assert contact.phone
        return cls(
            name=f'{contact.first_name} {contact.last_name}',
            phone=contact.phone,
            email=contact.email,
        )


@dataclass
class Address:
    fullname: str
    coordinates: Location
    country: Optional[str] = None
    city: Optional[str] = None
    street: Optional[str] = None

    @classmethod
    def from_core_address(cls, address: CoreAddress) -> 'Address':
        assert address.location
        return cls(
            fullname=', '.join(
                x for x in [address.country, address.region, address.locality, address.street, address.building] if x
            ),  # TODO:
            coordinates=Location(latitude=address.location.latitude, longitude=address.location.longitude),
            country=address.country,
            city=address.locality,
            street=address.street,
        )


@unique
class RoutePointType(Enum):
    SOURCE = 'source'
    DESTINATION = 'destination'
    RETURN = 'return'


@dataclass
class RoutePoint:
    point_id: int
    visit_order: int  # Порядок посещения точки (нумерация с 1)
    type: RoutePointType = field(metadata=dict(by_value=True))
    address: Address
    contact: Contact


@dataclass
class CreateClaimRequest:
    items: List[Item]
    route_points: List[RoutePoint]
    emergency_contact: Optional[Contact] = None
    same_day_data: Optional[SameDayData] = None


@unique
class ClaimStatus(Enum):
    NEW = 'new'
    ESTIMATING = 'estimating'
    ESTIMATING_FAILED = 'estimating_failed'
    READY_FOR_APPROVAL = 'ready_for_approval'
    ACCEPTED = 'accepted'
    PERFORMER_LOOKUP = 'performer_lookup'
    PERFORMER_DRAFT = 'performer_draft'
    PERFORMER_FOUND = 'performer_found'
    PERFORMER_NOT_FOUND = 'performer_not_found'
    PICKUP_ARRIVED = 'pickup_arrived'
    READY_FOR_PICKUP_CONFIRMATION = 'ready_for_pickup_confirmation'
    PICKUPED = 'pickuped'
    DELIVERY_ARRIVED = 'delivery_arrived'
    READY_FOR_DELIVERY_CONFIRMATION = 'ready_for_delivery_confirmation'
    PAY_WAITING = 'pay_waiting'
    DELIVERED = 'delivered'
    DELIVERED_FINISH = 'delivered_finish'
    RETURNING = 'returning'
    RETURN_ARRIVED = 'return_arrived'
    READY_FOR_RETURN_CONFIRMATION = 'ready_for_return_confirmation'
    RETURNED = 'returned'
    RETURNED_FINISH = 'returned_finish'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    CANCELLED_WITH_PAYMENT = 'cancelled_with_payment'
    CANCELLED_BY_TAXI = 'cancelled_by_taxi'
    CANCELLED_WITH_ITEMS_ON_HANDS = 'cancelled_with_items_on_hands'


@dataclass
class Offer:
    offer_id: str
    price: Decimal
    valid_until: Optional[datetime] = None


@dataclass
class ErrorMessage:
    code: str
    message: str


@dataclass
class Pricing:
    offer: Optional[Offer] = None
    final_price: Optional[Decimal] = None
    currency: Optional[str] = None


@dataclass
class Claim:
    id: str
    version: int
    revision: int
    updated_ts: datetime
    status: ClaimStatus = field(default=ClaimStatus.NEW, metadata=dict(by_value=True))
    pricing: Optional[Pricing] = None
    error_messages: Optional[List[ErrorMessage]] = None


@dataclass
class AcceptClaimResponse:
    id: str
    status: ClaimStatus = field(metadata=dict(by_value=True))
    version: int


@unique
class CancelState(Enum):
    FREE = 'free'
    PAID = 'paid'
    UNAVAILABLE = 'unavailable'


@dataclass
class CancelClaimResponse:
    """
    Не используй version из ответа. Там лежит фуфло.
    """

    id: str
    status: ClaimStatus = field(metadata=dict(by_value=True))
