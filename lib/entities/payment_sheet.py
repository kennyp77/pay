from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum, unique
from typing import List, Optional
from uuid import UUID

from pay.lib.entities.enums import AuthMethod, CardNetwork, ClassicPaymentMethodType, PaymentItemType
from pay.lib.entities.order import ContactFields


@unique
class MITOptionsType(Enum):
    RECURRING = 'RECURRING'
    DEFERRED = 'DEFERRED'


@dataclass
class PaymentSheetMITOptions:
    type: MITOptionsType
    optional: bool = False


@dataclass
class PaymentItemQuantity:
    count: Decimal
    label: Optional[str] = None


@dataclass
class PaymentOrderItem:
    amount: Decimal
    label: str
    quantity: Optional[PaymentItemQuantity] = None
    type: Optional[PaymentItemType] = None


@dataclass
class PaymentOrderTotal:
    amount: Decimal
    label: Optional[str] = None


@dataclass
class PaymentOrder:
    id: str
    total: PaymentOrderTotal
    items: Optional[List[PaymentOrderItem]] = None


@dataclass
class PaymentMerchant:
    id: UUID
    name: str
    url: Optional[str] = None


@dataclass
class PaymentMethod:
    method_type: ClassicPaymentMethodType = field(metadata=dict(dump_to='type', load_from='type'))
    gateway: Optional[str] = None
    gateway_merchant_id: Optional[str] = None
    allowed_auth_methods: Optional[List[AuthMethod]] = None
    allowed_card_networks: Optional[List[CardNetwork]] = None
    verification_details: bool = False


@dataclass
class ShippingTypes:
    direct: Optional[bool] = None
    pickup: Optional[bool] = None


@dataclass
class PaymentSheetRequiredFields:
    billing_contact: Optional[ContactFields] = None
    shipping_contact: Optional[ContactFields] = None
    shipping_types: Optional[ShippingTypes] = None


@dataclass
class PaymentSheet:
    version: int
    merchant: PaymentMerchant
    currency_code: str
    country_code: str
    payment_methods: List[PaymentMethod]
    order: PaymentOrder
    required_fields: Optional[PaymentSheetRequiredFields] = None
    mit_options: Optional[PaymentSheetMITOptions] = None
