from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from enum import Enum, unique
from typing import List, Optional
from uuid import UUID

from pay.lib.entities.cart import Cart
from pay.lib.entities.contact import Contact
from pay.lib.entities.enums import CardNetwork, PaymentMethodType
from pay.lib.entities.shipping import Address, ShippingMethod, ShippingOptions


@unique
class PaymentStatus(Enum):
    """
    https://a.yandex-team.ru/arc_vcs/billing/yandex_pay/docs/merchant-api.md#notifikaciya-ob-izmenenii-statusa-zakaza
    """

    PENDING = 'PENDING'
    AUTHORIZED = 'AUTHORIZED'
    CAPTURED = 'CAPTURED'
    VOIDED = 'VOIDED'
    REFUNDED = 'REFUNDED'
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
    FAILED = 'FAILED'


@dataclass
class PaymentMethod:
    method_type: PaymentMethodType
    card_last4: Optional[str] = None
    card_network: Optional[CardNetwork] = None


@dataclass
class ContactFields:
    email: Optional[bool] = None
    name: Optional[bool] = None
    phone: Optional[bool] = None


@dataclass
class RequiredFields:
    billing_contact: Optional[ContactFields] = None
    shipping_contact: Optional[ContactFields] = None


@dataclass
class Order:
    currency_code: str
    cart: Cart
    checkout_order_id: Optional[UUID] = None
    merchant_id: Optional[UUID] = None
    order_amount: Optional[Decimal] = None
    order_id: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    shipping: Optional[ShippingOptions] = None
    shipping_method: Optional[ShippingMethod] = None
    shipping_address: Optional[Address] = None
    shipping_contact: Optional[Contact] = None
    billing_contact: Optional[Contact] = None
    metadata: Optional[str] = None

    available_payment_methods: Optional[List[PaymentMethodType]] = None
    enable_coupons: Optional[bool] = None
    enable_comment_field: Optional[bool] = None
    required_fields: Optional[RequiredFields] = None

    created: Optional[datetime] = None
    updated: Optional[datetime] = None

    payment_status: Optional[PaymentStatus] = None
    reason: Optional[str] = None

    t: Optional[str] = None
