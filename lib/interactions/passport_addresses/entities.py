from dataclasses import dataclass
from enum import Enum, unique
from typing import Optional

from pay.lib.entities.shipping import Address as CoreAddress
from pay.lib.entities.shipping import Location  # noqa


@unique
class Service(Enum):
    LAVKA = 'lavka'
    MAPS = 'maps'
    MARKET = 'market'
    PASSPORT = 'passport'
    PASSPORT_DELIVERY = 'passport_delivery'
    PAY = 'pay'
    TAXI = 'taxi'


@dataclass
class Address(CoreAddress):
    owner_service: Service = Service.PAY
    type: Optional[str] = None


@dataclass
class Contact:
    id: Optional[str] = None
    first_name: Optional[str] = None
    second_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    owner_service: Service = Service.PAY
