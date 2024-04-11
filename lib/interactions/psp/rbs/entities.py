from dataclasses import dataclass, field
from enum import Enum, unique
from typing import List, Optional

from sendr_utils.schemas.validators import NonEmptyString

from pay.lib.entities.receipt import (
    Agent,
    MarkQuantity,
    MeasureType,
    PaymentSubjectType,
    PaymentType,
    Supplier,
    TransferOperator,
)


@unique
class RBSAcquirer(Enum):
    MTS = 'MTS'


@unique
class RBSOrderStatus(Enum):
    NEW = 0
    AUTHORIZED = 1
    CLEARED = 2
    REVERSED = 3
    REFUNDED = 4
    """В том числе частичный рефанд"""
    THREEDS = 5
    FAILED = 6


@dataclass
class BaseRBSCredentials:
    username: str = field(metadata={'validate': [NonEmptyString()], 'required': True})
    password: str = field(metadata={'validate': [NonEmptyString()]})
    gateway_merchant_id: str = field(metadata={'validate': [NonEmptyString()], 'required': True})


@dataclass
class AlfaBankCredentials(BaseRBSCredentials):
    pass


@dataclass
class RBSCredentials(BaseRBSCredentials):
    acquirer: RBSAcquirer


@dataclass
class RegisterResult:
    order_id: str


@dataclass
class PaymentResultSuccess:
    pass


@dataclass
class PaymentResult3DSV1:
    acs_url: str
    pa_req: str


@dataclass
class PaymentResult3DSV2Fingerprinting:
    threeds_server_transaction_id: str = field(metadata={'load_from': 'threeDSServerTransId'})
    three_ds_server_fingerprint_url: str = field(metadata={'load_from': 'threeDSMethodURLServer'})
    three_ds_acs_fingerprint_url: Optional[str] = field(metadata={'load_from': 'threeDSMethodURL'})
    three_ds_acs_fingerprint_url_params_name: str = field(init=False, default='threeDSMethodData')
    three_ds_acs_fingerprint_url_param_value: Optional[str] = field(metadata={'load_from': 'threeDSMethodDataPacked'})


@dataclass
class PaymentResult3DSV2Challenge:
    acs_url: str
    creq: str = field(metadata={'load_from': 'packedCReq'})


@dataclass
class CustomerDetails:
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    contact: Optional[str] = None
    passport: Optional[str] = None
    inn: Optional[str] = None


@dataclass
class Quantity:
    value: float
    measure: MeasureType = field(metadata=dict(by_value=True))


@unique
class RBSTaxType(Enum):
    NO_VAT = 0
    VAT_0 = 1
    VAT_10 = 2
    VAT_10_110 = 4
    VAT_20 = 6
    VAT_20_120 = 7


@dataclass
class Tax:
    tax_type: RBSTaxType = field(metadata=dict(by_value=True))
    tax_sum: Optional[int] = None


@dataclass
class AgentInfo(Agent):
    operation: Optional[str] = field(default=None, metadata=dict(dump_to='paying.operation'))
    phones: Optional[List[str]] = field(default=None, metadata=dict(dump_to='paying.phones'))
    transfer_operator: Optional[TransferOperator] = field(default=None, metadata=dict(dump_to='MTOperator'))


@dataclass
class ItemAttributes:
    payment_method: Optional[PaymentType] = field(default=None, metadata=dict(by_value=True))
    payment_object: Optional[PaymentSubjectType] = field(default=None, metadata=dict(by_value=True))
    nomenclature: Optional[str] = None
    mark_quantity: Optional[MarkQuantity] = None
    agent_info: Optional[AgentInfo] = None
    supplier_info: Optional[Supplier] = None


@dataclass
class Position:
    position_id: str
    name: str
    quantity: Quantity
    item_code: str
    item_price: int
    tax: Tax
    item_attributes: ItemAttributes = field(default_factory=ItemAttributes)


@dataclass
class Cart:
    items: List[Position]


@dataclass
class OrderBundle:
    customer_details: CustomerDetails
    cart_items: Cart


@dataclass
class Order:
    """
    RBS умеет отдавать всякие интересности: rrn, auth code, список рефандов, индикатор chargeback
    Добавляй сюда поля по мере надобности
    """

    order_status: RBSOrderStatus = field(metadata={'by_value': True})
    action_code: int
    """
    Ненулевой код ещё не говорит о том, что была ошибка. Коды -9000, -100 и 0 - вполне нормальные.
    Остальные коды - сигнал об ошибке. Вроде бы.
    """
    auth_ref_num: Optional[str] = None
