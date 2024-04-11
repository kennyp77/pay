import enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from sendr_utils.schemas.validators import NonEmptyString

from pay.lib.entities.receipt import PaymentSubjectType, PaymentType, TaxType


@enum.unique
class UnitellerTaxType(enum.Enum):
    VAT_20 = 20
    VAT_10 = 10
    VAT_20_120 = 120
    VAT_10_110 = 110
    VAT_0 = 0
    NO_VAT = -1

    @classmethod
    def from_tax_type(cls, tax_type: TaxType) -> 'UnitellerTaxType':
        return cls[tax_type.name]


@dataclass
class UnitellerCredentials:
    login: str = field(metadata={'validate': [NonEmptyString()]})
    password: str = field(metadata={'validate': [NonEmptyString()]})
    gateway_merchant_id: str = field(metadata={'validate': [NonEmptyString()]})
    # TODO: 2022-07-21 @perseus быстрое решение, так как на данный момент эта опция нужна только для Юнителлера
    send_receipt: Optional[bool] = False


@dataclass
class Result:
    result: int
    error_message: Optional[str] = None


@dataclass
class ChargeResult(Result):
    auth_code: Optional[str] = None
    rrn: Optional[str] = None


@dataclass
class RefundResult:
    # NOTE: это - так называемые S_FIELDS (см основную доку uniteller)
    # Возможно, стоит вынести в отдельный объект. S_FIELDS можно запросить в любом запросе, не только в рефанде
    # Содержат всякие пикантные подробности в т.ч. код ошибки эквайринга, код ошибки процессинга.
    status: Optional[str] = field(metadata={'load_from': 'status'})
    error_code: Optional[str] = field(metadata={'load_from': 'error_code'})
    order_number: Optional[str] = field(metadata={'load_from': 'ordernumber'})
    total: Optional[str] = field(metadata={'load_from': 'total'})
    response_code: Optional[str] = field(metadata={'load_from': 'response_code'})


@dataclass
class ThreeDSV1Params:
    # Интересно, зачем они добавили сюда term_url? Для удобства, наверное!
    acs_url: str
    pa_req: str
    md: str
    term_url: str


@dataclass
class ThreeDSV2Params:
    acs_url: str
    creq: str
    threeds_session_data: str


@dataclass
class ThreeDSResult(Result):
    # TODO: залогировать payment_attempt_id? Остальная ватруха наверное не понадобится
    payment_attempt_id: Optional[str] = None
    acquirer_id: Optional[str] = None
    comission: Optional[str] = None


@dataclass
class ThreeDSV1Result(ThreeDSResult):
    redirect_params: Optional[ThreeDSV1Params] = None
    redirect_form: Optional[str] = None


@dataclass
class ThreeDSV2Result(ThreeDSResult):
    # NOTE: тут могут содержаться параметры скрытого iframe (<ThreeDSMethod/>)
    # Но для yandex pay они не понадобятся
    redirect_params: Optional[ThreeDSV2Params] = None


@dataclass
class Customer:
    # Этот блок может отсутствовать целиком, или в нем могут отсутствовать какие-то элементы.
    phone: Optional[str] = None
    email: Optional[str] = None
    id: Optional[str] = None  # идентификатор плательщика, присвоенный мерчантом
    inn: Optional[str] = None


@dataclass
class Cashier:
    name: Optional[str] = None
    inn: Optional[str] = None


@dataclass
class ChequeLineProduct:
    kt: str  # код товара
    coc: str  # код страны происхождения товара
    ncd: str  # номер таможенной декларации
    exc: Optional[float] = None  # акциз


@dataclass
class ChequeLineAgent:
    agentattr: str  # TODO: 2022-05-17 @perseus WTF, в документации признак агента это степень двойки # Признак агента
    agentphone: str  # Телефон платежного агента
    accopphone: str  # Телефон оператора по приему платежей
    opphone: str  # Телефон оператора перевода
    opname: str  # наименование оператора перевода
    opinn: str  # ИНН оператора перевода
    opaddress: str  # адрес оператора перевода
    operation: str  # операция платежного агента
    suppliername: str  # наименование поставщика
    supplierinn: str  # ИНН поставщика
    supplierphone: str  # телефон поставщика


@dataclass
class ChequeLine:
    """Товарная позиция в чеке"""

    name: str
    price: float
    qty: float
    sum: float
    vat: UnitellerTaxType = field(metadata=dict(by_value=True))
    payattr: Optional[PaymentType] = field(default=None, metadata=dict(by_value=True))
    lineattr: Optional[PaymentSubjectType] = field(default=None, metadata=dict(by_value=True))
    product: Optional[ChequeLineProduct] = None
    agent: Optional[ChequeLineAgent] = None


class UnitellerPaymentKind(enum.Enum):
    CARD = 1  # Оплата банковской картой
    DIGITAL = 2  # Оплата электронной валютой
    BANK = 3  # Оплата с помощью кредитной организации
    OTHER = 4  # Оплата дополнительным платежным средством


class UnitellerPaymentType(enum.Enum):
    BANK_CARD_OR_DIGITAL = 0  # Оплата банковской картой, Оплата электронной валютой
    GIFT_CARD = 1  # Подарочные карты Мерчанта
    BONUS = 2  # Бонусы-авансы Мерчанта
    DIRECT_BONUS = 3  # Прямой аванс Мерчанта
    TICKET = 4  # Использование авансов/билетов
    BANK_CASH_MACHINE = 5  # Платеж через кредитную организацию (банкомат)
    BANK_ONLINE = 6  # Платеж через кредитную организацию (online)
    BANK_CASHLESS = 7  # Безналичное перечисление через банк
    CREDIT_ONLINE = 8  # Оплата «онлайн кредитом»
    SMS = 9  # Оплата по СМС
    ACQUIRING_EXTERNAL = 10  # Эквайринг внешний
    TERMINAL_DIGITAL = 11  # Платеж через терминал электронными
    TERMINAL_CACHE = 12  # Платеж через терминал наличными
    CACHE = 13  # Наличные
    CREDIT = 14  # Продажа в кредит
    COUNTER_PROVISION = 15  # Встречное предоставление
    UNITELLER_CERTIFICATE = 16  # Сертификат Uniteller


class TaxMode(enum.Enum):
    COMMON = 0  # Общая система налогообложения
    SIMPLE_REVENU = 1  # Упрощённая система налогообложения (Доход)
    SIMPLE_INCOCME = 2  # Упрощённая СН (Доход минус Расход)
    UNIFORM_REVENU = 3  # Единый налог на вмененный доход
    UNIFORM_AGRICULTURAL = 4  # Единый сельскохозяйственный налог
    PATENT = 5  # Патентная система налогообложения


@dataclass
class ChequePayment:
    kind: UnitellerPaymentKind = field(metadata=dict(by_value=True))
    type: UnitellerPaymentType = field(metadata=dict(by_value=True))
    amount: float
    id: Optional[str] = None


@dataclass
class ChequeParams:
    place: str


@dataclass
class Cheque:
    taxmode: TaxMode = field(metadata=dict(by_value=True))
    lines: List[ChequeLine]
    payments: List[ChequePayment]
    total: float
    customer: Optional[Customer] = None
    cashier: Optional[Cashier] = None
    optional: Optional[Dict[str, str]] = None
    params: Optional[ChequeParams] = None
