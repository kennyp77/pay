from dataclasses import dataclass
from datetime import date, datetime, time
from decimal import Decimal
from enum import Enum
from typing import ClassVar, Dict, List, Optional, Union

from pay.lib.entities.cart import ItemReceipt
from pay.lib.entities.contact import Contact
from pay.lib.entities.enums import DeliveryCategory, PaymentMethodType, ShippingMethodType
from pay.lib.entities.exceptions import InvalidYandexDeliveryOptionError


@dataclass
class Location:
    latitude: float
    longitude: float


@dataclass
class BoundingBox:
    sw: Location
    ne: Location


@dataclass
class Address:
    country: str
    locality: str
    building: str
    address_line: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    street: Optional[str] = None
    id: Optional[str] = None
    room: Optional[str] = None
    entrance: Optional[str] = None
    floor: Optional[str] = None
    intercom: Optional[str] = None
    comment: Optional[str] = None
    zip: Optional[str] = None
    location: Optional[Location] = None
    locale: Optional[str] = None


# FIXME: @dataclass(kw_only=True)
@dataclass
class BaseCourierOption:
    """
    Базовые свойства всякой курьерской доставки. Будь то кастомщина, ya.delivery, dhl, etc
    """

    amount: Decimal
    category: DeliveryCategory
    title: str
    # FIXME: uncomment
    # receipt: Optional[ItemReceipt] = None
    # allowed_payment_methods: Optional[List[PaymentMethodType]] = None

    def option_id(self) -> str:
        raise NotImplementedError


# FIXME: @dataclass(kw_only=True)
@dataclass
class CourierOption(BaseCourierOption):
    courier_option_id: str
    provider: str
    from_date: date
    to_date: Optional[date] = None
    from_time: Optional[time] = None
    to_time: Optional[time] = None

    # FIXME: remove fields
    receipt: Optional[ItemReceipt] = None
    allowed_payment_methods: Optional[List[PaymentMethodType]] = None

    @property
    def option_id(self) -> str:
        return self.courier_option_id


@dataclass
class PickupSchedule:
    label: str
    from_time: time
    to_time: time


@dataclass
class PickupOption:
    pickup_point_id: str
    provider: str
    location: Location
    title: str
    address: str
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    phones: Optional[List[str]] = None
    storage_period: Optional[int] = None
    schedule: Optional[List[PickupSchedule]] = None
    receipt: Optional[ItemReceipt] = None
    allowed_payment_methods: Optional[List[PaymentMethodType]] = None

    @property
    def option_id(self):
        return self.pickup_point_id


# FIXME: @dataclass(kw_only=True)
@dataclass
class YandexDeliveryOption(BaseCourierOption):
    receipt: ItemReceipt
    allowed_payment_methods: List[PaymentMethodType]

    yandex_delivery_option_id: str
    from_datetime: Optional[datetime] = None
    to_datetime: Optional[datetime] = None

    @property
    def option_id(self):
        return self.yandex_delivery_option_id

    def validate(self) -> None:
        if self.category == DeliveryCategory.EXPRESS:
            if self.from_datetime is not None or self.to_datetime is not None:
                raise InvalidYandexDeliveryOptionError(
                    'For category EXPRESS it is expected for both from_datetime and to_datetime to be null'
                )
        elif self.category == DeliveryCategory.TODAY:
            if self.from_datetime is None or self.to_datetime is None:
                raise InvalidYandexDeliveryOptionError(
                    'For category TODAY it is expected for both from_datetime and to_datetime to be not null'
                )
        else:
            raise InvalidYandexDeliveryOptionError('Category not supported')


@dataclass
class ShippingMethod:
    method_type: ShippingMethodType
    courier_option: Optional[CourierOption] = None
    pickup_option: Optional[PickupOption] = None
    yandex_delivery_option: Optional[YandexDeliveryOption] = None

    _shipping_method_to_option: ClassVar[Dict[ShippingMethodType, str]] = {
        ShippingMethodType.PICKUP: 'pickup_option',
        ShippingMethodType.COURIER: 'courier_option',
        ShippingMethodType.DIRECT: 'courier_option',
        ShippingMethodType.YANDEX_DELIVERY: 'yandex_delivery_option',
    }

    def has_exactly_one_option(self) -> bool:
        return 1 == sum((bool(self.courier_option), bool(self.pickup_option), bool(self.yandex_delivery_option)))

    def get_option(self) -> Union[CourierOption, PickupOption, YandexDeliveryOption]:
        assert self.has_exactly_one_option()
        return getattr(self, self.get_option_name())

    def get_option_name(self) -> str:
        return self._shipping_method_to_option[self.method_type]


@dataclass
class ShippingWarehouse:
    address: Address
    contact: Contact
    emergency_contact: Contact


@dataclass
class YandexDeliveryShippingParams:
    warehouse: Optional[ShippingWarehouse] = None
    options: Optional[List[YandexDeliveryOption]] = None


@dataclass
class ShippingOptions:
    available_methods: List[ShippingMethodType]
    available_courier_options: Optional[List[CourierOption]] = None
    yandex_delivery: Optional[YandexDeliveryShippingParams] = None


@dataclass
class ShippingPrice:
    method_type: ShippingMethodType
    amount: Decimal


class DeliveryStatus(Enum):
    NEW = 'NEW'
    ESTIMATING = 'ESTIMATING'
    EXPIRED = 'EXPIRED'
    READY_FOR_APPROVAL = 'READY_FOR_APPROVAL'
    COLLECTING = 'COLLECTING'
    PREPARING = 'PREPARING'
    DELIVERING = 'DELIVERING'
    DELIVERED = 'DELIVERED'
    RETURNING = 'RETURNING'
    RETURNED = 'RETURNED'
    FAILED = 'FAILED'
    CANCELLED = 'CANCELLED'
