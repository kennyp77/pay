from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum, unique
from typing import List, Optional

from sendr_utils.schemas.validators import NonEmptyString

from pay.lib.utils.currency import amount_from_minor_units


@unique
class SuccessStatus(Enum):
    SUCCESS = 'True'
    FAILURE = 'False'
    THREEDS = '3DS'


@unique
class OrderState(Enum):
    NEW = 'New'
    PRE_AUTHORIZED_3DS = 'PreAuthorized3DS'
    AUTHORIZED = 'Authorized'
    VOIDED = 'Voided'
    CHARGED = 'Charged'
    REFUNDED = 'Refunded'
    FORWARDED = 'Forwarded'
    REJECTED = 'Rejected'
    CHARGEBACK = 'Chargeback'
    OBSOLETE = 'Obsolete'


@dataclass
class PaytureAPICredentials:
    key: str = field(metadata={'validate': [NonEmptyString()], 'required': True})
    password: str = field(metadata={'validate': [NonEmptyString()]})
    gateway_merchant_id: str = field(metadata={'validate': [NonEmptyString()]})


@dataclass
class AddInfo:
    auth_code: str
    ref_number: str


@dataclass
class BlockSuccess:
    add_info: AddInfo


@dataclass
class Block3DSV1Required:
    acs_url: str
    pa_req: str
    three_ds_key: str


@dataclass
class Block3DSV2Required:
    acs_url: str
    creq: str
    threeds_session_data: str


@dataclass
class AmountUpdateResult:
    raw_new_amount: int

    @property
    def new_amount(self) -> Decimal:
        return amount_from_minor_units(minor_units=self.raw_new_amount, currency='RUB')


@dataclass
class ChargeResult(AmountUpdateResult):
    pass


@dataclass
class RefundResult(AmountUpdateResult):
    pass


@dataclass
class UnblockResult(AmountUpdateResult):
    pass


@dataclass
class Order:
    order_id: str
    state: OrderState
    raw_amount: int
    rrn: str
    add_info: AddInfo

    @property
    def amount(self) -> Decimal:
        return amount_from_minor_units(minor_units=self.raw_amount, currency='RUB')


@dataclass
class AgentInfo:
    payment_agent_operation: Optional[str] = None
    payment_agent_phone_numbers: Optional[List[str]] = None
    payment_operator_name: Optional[str] = None
    payment_operator_address: Optional[str] = None
    payment_operator_inn: Optional[str] = field(default=None, metadata={'dump_to': 'PaymentOperatorINN'})
    payment_operator_phone_number: Optional[List[str]] = None
    payment_transfer_operator_phone_numbers: Optional[List[str]] = None


@dataclass
class SupplierInfo:
    name: str
    phone_numbers: Optional[List[str]] = None


@dataclass
class ChequePosition:
    quantity: float
    price: float
    tax: int
    text: str
    agent_type: Optional[int] = None
    agent_info: Optional[AgentInfo] = None
    payment_method_type: Optional[int] = None
    customs_declaration_number: Optional[str] = None
    excise: Optional[float] = None
    manufacturer_country_code: Optional[str] = None
    payment_subject_type: Optional[int] = None
    nomenclature_code: Optional[str] = None
    supplier_inn: Optional[str] = field(default=None, metadata={'dump_to': 'SupplierINN'})
    supplier_info: Optional[SupplierInfo] = None
    unit_of_measurement: Optional[str] = None


@dataclass
class Cheque:
    customer_contact: str
    positions: List[ChequePosition]
