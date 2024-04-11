from dataclasses import dataclass, field
from decimal import Decimal
from hashlib import md5
from typing import List, Optional

from sendr_utils.schemas.fields import BytesField

from pay.lib.entities.enums import CartItemType, CouponStatus
from pay.lib.entities.receipt import (
    Agent,
    MarkQuantity,
    MeasureType,
    PaymentSubjectType,
    PaymentType,
    Supplier,
    TaxType,
)


@dataclass
class CartTotal:
    amount: Decimal
    label: Optional[str] = None


@dataclass
class ItemQuantity:
    count: Decimal
    available: Optional[Decimal] = None
    label: Optional[str] = None


@dataclass
class Measurements:
    # Если станет понятно, что иногда какое-то из измерений должно быть необязательным - тогда добавь Optional
    # Пока требуем, чтобы измерения указывались полностью.
    length: float
    height: float
    width: float
    weight: float

    @staticmethod
    def empty():
        return Measurements(0, 0, 0, 0)


@dataclass
class ItemReceipt:
    """
    Вспомогательная информация для того, чтобы для элемента cart.item можно было сформировать чек.
    """

    tax: TaxType = field(metadata={'by_value': True})
    title: Optional[str] = None
    excise: Optional[Decimal] = None
    payment_method_type: Optional[PaymentType] = field(default=None, metadata={'by_value': True})
    measure: Optional[MeasureType] = field(default=None, metadata={'by_value': True})
    payment_subject_type: Optional[PaymentSubjectType] = field(default=None, metadata={'by_value': True})
    product_code: Optional[bytes] = field(
        default=None, metadata={'marshmallow_field': BytesField(required=False, default=None, missing=None)}
    )
    mark_quantity: Optional[MarkQuantity] = None
    agent: Optional[Agent] = None
    supplier: Optional[Supplier] = None


@dataclass
class CartItem:
    product_id: str
    quantity: ItemQuantity
    type: CartItemType = field(
        default=CartItemType.UNSPECIFIED, metadata={'required': False, 'missing': CartItemType.UNSPECIFIED.value}
    )
    title: Optional[str] = None
    total: Optional[Decimal] = None
    subtotal: Optional[Decimal] = None
    discounted_unit_price: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    measurements: Optional[Measurements] = None
    receipt: Optional[ItemReceipt] = None


@dataclass
class Discount:
    discount_id: str
    amount: Decimal = field(metadata=dict(as_string=True))
    description: str


@dataclass
class Coupon:
    value: str
    status: Optional[CouponStatus] = None
    description: Optional[str] = None


@dataclass
class Cart:
    items: List[CartItem]
    total: Optional[CartTotal] = field(metadata={'required': True, 'allow_none': False})
    cart_id: Optional[str] = None
    external_id: Optional[str] = None
    coupons: Optional[List[Coupon]] = None
    discounts: Optional[List[Discount]] = None
    measurements: Optional[Measurements] = None

    def hash(self) -> str:
        items = sorted(self.items, key=lambda v: v.product_id)

        def m(x):
            return (x.width, x.height, x.length, x.weight) if x else (0, 0, 0, 0)

        hash_fields = [*m(self.measurements)]
        for item in items:
            hash_fields.extend(m(item.measurements))
            hash_fields.append(item.quantity.count)

        h = md5()
        h.update(':'.join(map(str, hash_fields)).encode('utf-8'))

        return h.hexdigest()
