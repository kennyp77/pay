import enum
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pay.lib.entities.cart import Cart
from pay.lib.entities.enums import OperationStatus, OperationType
from pay.lib.entities.order import Contact, Order, PaymentStatus
from pay.lib.entities.payment_sheet import PaymentOrder
from pay.lib.entities.shipping import Address, BoundingBox, DeliveryStatus, PickupOption, ShippingMethodType


@enum.unique
class TransactionStatus(enum.Enum):
    """
    DEPRECATED
    """

    NEW = 'NEW'
    HOLD = 'HOLD'
    SUCCESS = 'SUCCESS'
    PARTIAL_REFUND = 'PARTIAL_REFUND'
    REFUND = 'REFUND'
    REVERSE = 'REVERSE'
    FAIL = 'FAIL'


@dataclass
class UpdateTransactionStatusRequest:
    order_id: str
    status: TransactionStatus
    event_time: datetime


@enum.unique
class EventType(enum.Enum):
    TRANSACTION_STATUS_UPDATE = 'TRANSACTION_STATUS_UPDATE'
    ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED'
    OPERATION_STATUS_UPDATED = 'OPERATION_STATUS_UPDATED'


@dataclass
class MerchantWebhookRequest:
    merchant_id: UUID
    event: EventType
    data: UpdateTransactionStatusRequest


@dataclass
class OrderWebhookData:
    order_id: str
    payment_status: Optional[PaymentStatus] = None
    delivery_status: Optional[DeliveryStatus] = None


@dataclass
class OperationWebhookData:
    operation_id: UUID
    order_id: str
    status: OperationStatus
    operation_type: OperationType
    external_operation_id: Optional[str] = None


@dataclass
class MerchantWebhookV1Request:
    merchant_id: UUID
    event: EventType
    event_time: datetime
    order: Optional[OrderWebhookData] = None
    operation: Optional[OperationWebhookData] = None


@enum.unique
class ReasonCode(enum.Enum):
    FORBIDDEN = 'FORBIDDEN'
    ITEM_NOT_FOUND = 'ITEM_NOT_FOUND'
    ORDER_NOT_FOUND = 'ORDER_NOT_FOUND'
    ORDER_AMOUNT_MISMATCH = 'ORDER_AMOUNT_MISMATCH'
    ORDER_DETAILS_MISMATCH = 'ORDER_DETAILS_MISMATCH'
    OUT_OF_INVENTORY = 'OUT_OF_INVENTORY'
    PICKUP_POINT_NOT_FOUND = 'PICKUP_POINT_NOT_FOUND'
    SHIPPING_DETAILS_MISMATCH = 'SHIPPING_DETAILS_MISMATCH'
    OTHER = 'OTHER'


@dataclass
class MerchantResponse:
    code: int
    reason_code: Optional[ReasonCode] = None
    reason: Optional[str] = None


@dataclass
class ShippingOption:
    id: Optional[str] = None


@dataclass
class PickupPoint:
    id: str


@dataclass
class Location:
    longitude: Optional[float] = None
    latitude: Optional[float] = None


@dataclass
class ShippingMethodInfo:
    type: ShippingMethodType
    shipping_address: Optional[Address] = None
    shipping_option: Optional[ShippingOption] = None
    pickup_point: Optional[PickupPoint] = None


@dataclass
class MerchantCreateOrderRequest:
    merchant_id: UUID
    currency_code: str
    order: PaymentOrder
    shipping_method_info: Optional[ShippingMethodInfo] = None
    shipping_contact: Optional[Contact] = None


@dataclass
class MerchantRenderOrderResponse:
    status: str
    data: Order


@dataclass
class MerchantCreateOrderResponse:
    order_id: str
    metadata: Optional[str] = None


@dataclass
class MerchantCreateOrderV1Response:
    status: str
    data: MerchantCreateOrderResponse


@dataclass
class MerchantPickupOptionsRequest:
    merchant_id: UUID
    currency_code: str
    cart: Cart
    bounding_box: BoundingBox
    metadata: Optional[str] = None


@dataclass
class MerchantPickupOptionsResponseData:
    pickup_options: List[PickupOption]


@dataclass
class MerchantPickupOptionsResponse:
    status: str
    data: MerchantPickupOptionsResponseData


@dataclass
class MerchantPickupOptionDetailsRequest:
    merchant_id: UUID
    currency_code: str
    cart: Cart
    pickup_point_id: str
    metadata: Optional[str] = None


@dataclass
class MerchantPickupOptionDetailsResponseData:
    pickup_option: PickupOption


@dataclass
class MerchantPickupOptionDetailsResponse:
    status: str
    data: MerchantPickupOptionDetailsResponseData
