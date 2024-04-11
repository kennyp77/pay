from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum, unique
from typing import List, Optional


@unique
class TaxType(Enum):
    VAT_20 = 1
    VAT_10 = 2
    VAT_20_120 = 3
    VAT_10_110 = 4
    VAT_0 = 5
    NO_VAT = 6


@unique
class MeasureType(Enum):
    PIECE = 0
    GRAM = 10
    KILOGRAM = 11
    TON = 12
    CENTIMETER = 20
    DECIMETER = 21
    METER = 22
    SQUARE_CENTIMETER = 30
    SQUARE_DECIMETER = 31
    SQUARE_METER = 32
    MILLILITER = 40
    LITER = 41
    CUBIC_METER = 42
    KILOWATT_HOUR = 50
    GIGACALORIE = 51
    DAY = 70
    HOUR = 71
    MINUTE = 72
    SECOND = 73
    KILOBYTE = 80
    MEGABYTE = 81
    GIGABYTE = 82
    TERABYTE = 83
    OTHER = 255


@unique
class PaymentType(Enum):
    FULL_PREPAYMENT = 1
    PARTIAL_PREPAYMENT = 2
    ADVANCE = 3
    FULL_PAYMENT = 4
    PARTIAL_PAYMENT = 5
    CREDIT = 6
    CREDIT_PAYMENT = 7


@unique
class PaymentSubjectType(Enum):
    COMMODITY = 1
    EXCISE = 2
    JOB = 3
    SERVICE = 4
    GAMBLING_BET = 5
    GAMBLING_PRIZE = 6
    LOTTERY = 7
    LOTTERY_PRIZE = 8
    INTELLECTUAL_ACTIVITY = 9
    PAYMENT = 10
    AGENT_COMMISSION = 11
    COMPOSITE = 12
    ANOTHER = 13
    PROPERTY_RIGHT = 14
    NON_OPERATING_GAIN = 15
    INSURANCE_PREMIUM = 16
    SALES_TAX = 17
    RESORT_FEE = 18
    LIEN = 19
    COST = 20
    PENSION_INSURANCE_WITHOUT_PAYOUTS = 21
    PENSION_INSURANCE_WITH_PAYOUTS = 22
    HEALTH_INSURANCE_WITHOUT_PAYOUTS = 23
    HEALTH_INSURANCE_WITH_PAYOUTS = 24
    HEALTH_INSURANCE = 25
    CASINO = 26


@unique
class AgentType(Enum):
    BANKING_PAYMENT_AGENT = 1
    BANKING_PAYMENT_SUBAGENT = 2
    PAYMENT_AGENT = 3
    PAYMENT_SUBAGENT = 4
    ATTORNEY = 5
    COMMISSIONER = 6
    OTHER = 7


@dataclass
class ReceiptItemQuantity:
    count: Decimal
    measure: Optional[MeasureType] = field(default=None, metadata={'by_value': True})


@dataclass
class MarkQuantity:
    numerator: int
    denominator: int


@dataclass
class Supplier:
    inn: Optional[str] = None
    name: Optional[str] = None
    phones: Optional[List[str]] = None


@dataclass
class TransferOperator:
    inn: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    phones: Optional[List[str]] = None


@dataclass
class PaymentsOperator:
    phones: Optional[List[str]] = None


@dataclass
class Agent:
    agent_type: AgentType = field(metadata={'by_value': True})
    operation: Optional[str] = None
    phones: Optional[List[str]] = None
    transfer_operator: Optional[TransferOperator] = None
    payments_operator: Optional[PaymentsOperator] = None


@dataclass
class ReceiptItem:
    title: str
    discounted_unit_price: Decimal
    quantity: ReceiptItemQuantity
    tax: TaxType = field(metadata={'by_value': True})
    product_id: str

    excise: Optional[Decimal] = None
    payment_method_type: Optional[PaymentType] = field(default=None, metadata={'by_value': True})
    payment_subject_type: Optional[PaymentSubjectType] = field(default=None, metadata={'by_value': True})
    product_code: Optional[bytes] = None
    mark_quantity: Optional[MarkQuantity] = None
    supplier: Optional[Supplier] = None
    agent: Optional[Agent] = None


@dataclass
class Receipt:
    """
    Обобщенный объект чека. Используется там, где необходимо представить чек как единое целое.
    Не является psp-специфичным
    Пример использования: бэкенд по корзине генерирует чек (Receipt). В дальнейшем, перед походом в psp,
    обобщенный Receipt преобразуется в psp-специфичный receipt
    """

    items: List[ReceiptItem]

    @property
    def total(self) -> Decimal:
        return Decimal(sum(x.quantity.count * x.discounted_unit_price for x in self.items))
