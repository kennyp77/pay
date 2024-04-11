from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum, unique
from typing import List, Optional, Set


@unique
class YandexSplitPaymentStatus(Enum):
    PAID = 'paid'
    FAILED = 'failed'
    COMING = 'coming'
    CANCELED = 'canceled'
    EXPECTED = 'expected'


@unique
class YandexSplitPaymentPlanStatus(Enum):
    DRAFT = 'draft'
    CONFIRMED = 'confirmed'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    COMPLETED = 'completed'
    EXPIRED = 'expired'


@unique
class YandexSplitOrderStatus(Enum):
    NEW = 'new'
    PROCESSING = 'processing'
    APPROVED = 'approved'
    COMMITED = 'commited'
    REFUNDED = 'refunded'
    PARTIALLY_REFUNDED = 'partially_refunded'
    FAILED = 'failed'

    @classmethod
    def success_statuses(cls) -> Set['YandexSplitOrderStatus']:
        return {
            YandexSplitOrderStatus.APPROVED,
            YandexSplitOrderStatus.COMMITED,
            YandexSplitOrderStatus.PARTIALLY_REFUNDED,
        }


@unique
class YandexSplitOrderServiceType(Enum):
    LOAN = 'loan'
    PAYMENT = 'payment'


@dataclass
class YandexSplitPayment:
    datetime: datetime
    amount: Decimal
    status: Optional[YandexSplitPaymentStatus] = None


@dataclass
class YandexSplitPaymentPlanDetails:
    payments: List[YandexSplitPayment]
    deposit: Optional[Decimal] = None
    loan: Optional[Decimal] = None


@dataclass
class YandexSplitPaymentPlan:
    id: str
    user_id: str
    class_name: str
    status: YandexSplitPaymentPlanStatus
    details: YandexSplitPaymentPlanDetails

    sum: Optional[Decimal] = None
    constructor: Optional[str] = None

    @property
    def payments(self) -> List[YandexSplitPayment]:
        return self.details.payments


@dataclass
class YandexSplitOrderCheckoutInfo:
    order_id: str
    checkout_url: str


@dataclass
class YandexSplitOrderServiceItem:
    item_code: str
    count: int


@dataclass
class YandexSplitOrderService:
    type: YandexSplitOrderServiceType
    currency: str
    amount: Decimal
    items: List[YandexSplitOrderServiceItem] = field(default_factory=list)


@dataclass
class YandexSplitOrderMeta:
    order_id: Optional[str] = None
    user_id: Optional[str] = None
    external_id: Optional[str] = None
    merchant_id: Optional[str] = None
    created_at: Optional[datetime] = None


@dataclass
class YandexSplitConsumer:
    title: Optional[str] = None
    id: Optional[str] = None


@dataclass
class YandexSplitOrder:
    services: List[YandexSplitOrderService]
    status: YandexSplitOrderStatus
    order_meta: YandexSplitOrderMeta
    consumer: Optional[YandexSplitConsumer] = None
