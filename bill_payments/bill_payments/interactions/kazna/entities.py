import enum
import typing
from dataclasses import dataclass
from datetime import date, datetime
from hashlib import md5
from typing import Any, Dict, List, Optional, Union, cast

import yarl

from sendr_utils import without_none

from pay.bill_payments.bill_payments.conf import settings


@enum.unique
class DepartmentType(enum.Enum):
    GIBDD = 'gibdd'
    FNS = 'fns'
    FSSP = 'fssp'
    ROSREESTR = 'rosreestr'
    ROSREESTR_OFFER = 'rosreestrOffer'
    GUVMMVD = 'guvmmvd'
    ROSGVARD = 'rosgvard'
    PARK = 'park{}'
    PARK_FINES = 'parkFines{}'
    JKH = 'jkh'
    RNIP = 'rnip'
    DONATION = 'donation'
    JUSTICE = 'justice'
    UNKNOWN = 'unknown'

    def by_region(self, region_code: Optional[str] = None) -> str:
        """Тип департамента в зависимости от региона"""
        return self.value.format(region_code) if self in [self.PARK, self.PARK_FINES] else self.value


@enum.unique
class DocumentCode(enum.Enum):
    PASSPORT_RUSSIAN_FEDERATION = '01'
    PASSPORT_FOREIGN = '08'
    DRIVER_LICENSE = '22'
    VEHICLE_REGISTRATION_CERTIFICATE = '24'
    ELS = '91'


class SearchStatus(enum.Enum):
    PART = 'part'
    COMPLETE = 'complete'


@dataclass
class SinglePayerDoc:
    code: DocumentCode
    value: str


@dataclass
class PayerDoc:
    code: DocumentCode
    value: List[str]


@dataclass
class AddressJKH:
    region: Optional[str] = None
    city: Optional[str] = None
    street: Optional[str] = None
    house_num: Optional[str] = None
    fias_house_guid: Optional[str] = None
    apartment: Optional[str] = None
    address_string: Optional[str] = None


@dataclass
class PayPeriod:
    year: Optional[str] = None
    month: Optional[str] = None


@dataclass
class AdditionalData:
    discount_size: Optional[str] = None
    discount_date: Optional[date] = None
    spi_name_phone: Optional[str] = None
    legal_act: Optional[str] = None
    offense_name: Optional[str] = None
    offense_place: Optional[str] = None
    offense_date: Optional[datetime] = None


@dataclass
class PaymentData:
    sum: Optional[int] = None
    date: Optional[datetime] = None


@dataclass
class ChargeData:
    bill_date: datetime
    amount_to_pay: Optional[int] = None  # minor units
    account_number_jkh: Optional[str] = None
    address_user_jkh: Optional[AddressJKH] = None
    purpose: Optional[str] = None
    kbk: Optional[str] = None
    oktmo: Optional[str] = None
    inn: Optional[str] = None
    kpp: Optional[str] = None
    bik: Optional[str] = None
    payee_corr_account: Optional[str] = None
    account_number: Optional[str] = None
    payee_name: Optional[str] = None
    div_id: Optional[int] = None
    amount: Optional[int] = None  # minor units
    pay_period: Optional[PayPeriod] = None
    payer_identifier: Optional[str] = None
    payer_name: Optional[str] = None
    treasure_branch: Optional[str] = None
    additional_data: Optional[AdditionalData] = None
    payment_data: Optional[PaymentData] = None


@dataclass
class Charge:
    document: PayerDoc
    supplier_bill_id: str
    unified_payer_identifier: Optional[str] = None
    department: Optional[DepartmentType] = None
    main_supplier_bill_id: Optional[List[str]] = None
    payment_document_id: Optional[str] = None
    charge_data: Optional[ChargeData] = None


@dataclass
class SearchResponse:
    status: SearchStatus
    charges: List[Charge]


@dataclass
class SearchRequest:
    documents: List[PayerDoc]
    department: DepartmentType
    subscribe: Optional[str] = None


@enum.unique
class PayType(enum.Enum):
    PHONE = 'phone'
    CARD = 'card'
    DEPOSIT = 'deposit'
    APPLEPAY = 'applepay'
    GOOGLEPAY = 'googlepay'
    PSCB = 'pscb'
    YANDEXPAY = 'yandexpay'


@enum.unique
class DeviceChannel(enum.Enum):
    MOBILE_APP = '01'
    BROWSER = '02'
    REQUESTOR_3DS = '03'


@dataclass
class MpiExtInfo:
    notification_url: Optional[str] = None
    browser_accept_header: Optional[str] = None
    browser_color_depth: Optional[int] = None
    browser_ip: Optional[str] = None
    browser_language: Optional[str] = None
    browser_screen_height: Optional[int] = None
    browser_screen_width: Optional[int] = None
    browser_tz: Optional[str] = None
    browser_user_agent: Optional[str] = None
    device_channel: Optional[DeviceChannel] = None
    browser_java_enabled: Optional[bool] = None
    window_width: Optional[int] = None
    window_height: Optional[int] = None
    tds_notification_url: Optional[str] = None


@dataclass
class PayerParams:
    phone: Optional[int] = None
    fio: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    payer_doc: Optional[List[PayerDoc]] = None
    unified_account_number: Optional[str] = None
    account_number: Optional[str] = None
    additionalData: Optional[Dict[str, Any]] = None


@dataclass
class PaymentParams:
    supplier_bill_id: Optional[Union[List[str], str]] = None
    payment_document_id: Optional[Union[List[str], str]] = None
    packet_advance_payments: Optional[List[str]] = None
    purpose: Optional[str] = None
    kbk: Optional[str] = None
    oktmo: Optional[str] = None
    inn: Optional[str] = None
    kpp: Optional[str] = None
    bik: Optional[str] = None
    correspondent_bank_account: Optional[str] = None
    account_number: Optional[str] = None
    payee_name: Optional[str] = None
    treasure_branch: Optional[str] = None
    ls: Optional[str] = None
    pay_period: Optional[PayPeriod] = None
    additional_data: Optional[Dict[str, Any]] = None


@dataclass
class PayRequest:
    order_id: str
    kvit: bool
    payer_params: PayerParams
    payment_params: PaymentParams
    sign: Optional[str] = None
    pay_type: PayType = PayType.YANDEXPAY
    dep_type: Optional[DepartmentType] = None
    amount: Optional[int] = None
    total_sum: Optional[int] = None
    payer_id: Optional[str] = None
    card_id: Optional[str] = None
    cryptogram: Optional[str] = None
    mpi_ext_info: Optional[MpiExtInfo] = None
    apple_token: Optional[str] = None
    gp_token: Optional[str] = None
    yp_token: Optional[str] = None
    return_url: Optional[str] = None
    return_fail_url: Optional[str] = None

    def make_signature(self) -> None:
        def to_list(value: typing.Union[str, List[Any], None]) -> List[Any]:
            if isinstance(value, list):
                return value
            return [value]

        pp = self.payment_params
        # Порядок полей имеет значение!
        digest = filter(
            lambda x: x,
            [
                self.pay_type.value,
                str(int(self.kvit)),
                str(self.amount) if self.amount else None,
                *to_list(pp.supplier_bill_id),
                *to_list(pp.payment_document_id),
                *to_list(pp.packet_advance_payments),
                pp.purpose,
                pp.kbk,
                pp.oktmo,
                pp.inn,
                pp.kpp,
                pp.bik,
                pp.correspondent_bank_account,
                pp.account_number,
                pp.treasure_branch,
                pp.ls,
                pp.pay_period.year if pp.pay_period else None,
                pp.pay_period.month if pp.pay_period else None,
                settings.KAZNA_SALT,
            ],
        )
        digest_list = cast(List[str], list(digest))
        self.sign = md5(''.join(digest_list).encode('utf-8')).hexdigest()


@dataclass
class TDS:
    """
    TDS расшифровывается как 3ds.
    acs_url является базовым урлом 3ds ACS
    Остальные параметры должны быть переданы через url query.
    Я не очень силён в 3ds - лучше уточняйте у профессионалов. Но вот тебе рассказ.
    Есть два сценария: 3ds v1 и 3ds v2.
    В случае первой версии нужно в acs_url передать PaReq (PaymentRequest), TermUrl и MD.
    Во второй версии - creq (ChallengeRequest)
    """

    acs_url: Optional[str] = None
    term_url: Optional[str] = None
    pa_req: Optional[str] = None
    creq: Optional[str] = None
    md: Optional[str] = None

    def to_url(self) -> yarl.URL:
        """
        kazna сама понимает, какой сценарий применим к платежу, и отдаёт параметры корректно.
        Напр. в случае 3ds v1 казна НЕ отдаёт creq в ответе.
        Короче, мы просто делаем without_none - это всё, что от нас требуется.
        Note: имена параметров являются case sensitive! Установлено эмпирически и согласуется с документацией.
        """
        query = without_none(
            {
                'TermUrl': self.term_url,
                'PaReq': self.pa_req,
                'creq': self.creq,
                'MD': self.md,
            }
        )
        assert self.acs_url
        return yarl.URL(self.acs_url).with_query(query)


@dataclass
class PayResponse:
    payment_id: int
    redirect_url: Optional[str] = None
    tds: Optional[TDS] = None


@enum.unique
class PaymentStatusCode(enum.Enum):
    CREATED = '1'
    AUTH = '20'
    CANCEL = '30'
    REFUNDED = '40'


@dataclass
class PaymentStatus:
    code: PaymentStatusCode
    name: str
    date: Optional[datetime] = None
    cancel_reason: Optional[str] = None


@dataclass
class Card:
    pan: str
    card_type: str


@dataclass
class PaymentInfoResponse:
    payment_id: int
    order_id: str
    status: PaymentStatus
    dep_type: DepartmentType
    kvit: Optional[bool] = None
    amount: Optional[int] = None
    total_sum: Optional[int] = None
    pay_type: Optional[PayType] = None
    payment_params: Optional[PaymentParams] = None
    card: Optional[Card] = None
    uip: Optional[str] = None
    result: Optional[List[Any]] = None
    additional_data = Optional[Dict[str, Any]]


@dataclass
class SubscriptionInfoResponse:
    documents: List[PayerDoc]


@dataclass
class UnsubscribeRequest:
    subscription_id: str
    documents: List[PayerDoc]
