from enum import Enum, unique
from typing import Dict


class CartItemType(Enum):
    PHYSICAL = 'PHYSICAL'
    DIGITAL = 'DIGITAL'
    UNSPECIFIED = 'UNSPECIFIED'
    # У болта зачем-то есть ещё и BUNDLED.


@unique
class PaymentMethodType(Enum):
    CARD = 'CARD'
    SPLIT = 'SPLIT'
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
    CARD_ON_DELIVERY = 'CARD_ON_DELIVERY'


@unique
class ClassicPaymentMethodType(Enum):
    CARD = 'CARD'
    SPLIT = 'SPLIT'
    CASH = 'CASH'


@unique
class CouponStatus(Enum):
    VALID = 'VALID'
    INVALID = 'INVALID'
    EXPIRED = 'EXPIRED'


@unique
class DeliveryCategory(Enum):
    EXPRESS = 'EXPRESS'
    TODAY = 'TODAY'
    STANDARD = 'STANDARD'


@unique
class ShippingMethodType(Enum):
    DIRECT = 'DIRECT'  # legacy, renamed to COURIER. Remove when Brandshop adopts the new API
    PICKUP = 'PICKUP'
    COURIER = 'COURIER'
    YANDEX_DELIVERY = 'YANDEX_DELIVERY'


@unique
class PaymentItemType(Enum):
    DISCOUNT = 'DISCOUNT'
    SHIPPING = 'SHIPPING'
    PROMOCODE = 'PROMOCODE'
    ITEM = 'ITEM'
    PICKUP = 'PICKUP'


@unique
class TSPType(Enum):
    VISA = 'visa'
    MASTERCARD = 'mastercard'

    # special value if card can not be tokenized currently (better than Optional)
    UNKNOWN = 'unknown'


@unique
class IssuerBank(Enum):
    """
    Classified card issuers.
    """

    # special value for any unrecognized card issuer
    UNKNOWN = 'UNKNOWN'

    AK_BARS = 'AK_BARS'
    ALFABANK = 'ALFABANK'
    ATB = 'ATB'
    AVANGARD = 'AVANGARD'
    BANKROSSIYA = 'BANKROSSIYA'
    BELARUSBANK = 'BELARUSBANK'
    BELGAZPROMBANK = 'BELGAZPROMBANK'
    BELINVEST = 'BELINVEST'
    BINBANK = 'BINBANK'
    CITIBANK = 'CITIBANK'
    CREDIT_EUROPE = 'CREDIT_EUROPE'
    GAZPROMBANK = 'GAZPROMBANK'
    HOME_CREDIT = 'HOME_CREDIT'
    KASPI = 'KASPI'
    LEVOBEREZHNY = 'LEVOBEREZHNY'
    MINBANK = 'MINBANK'
    MKB = 'MKB'
    MODULBANK = 'MODULBANK'
    MTBANK = 'MTBANK'
    MTSBANK = 'MTSBANK'
    NOVIKOMBANK = 'NOVIKOMBANK'
    ORIENT = 'ORIENT'
    OTKRITIE = 'OTKRITIE'
    OTPBANK = 'OTPBANK'
    POCHTABANK = 'POCHTABANK'
    PRIORBANK = 'PRIORBANK'
    PRIVATBANK = 'PRIVATBANK'
    PSB = 'PSB'
    QAZKOM = 'QAZKOM'
    QIWI = 'QIWI'
    RAIFFEISEN = 'RAIFFEISEN'
    RENAISSANCE = 'RENAISSANCE'
    RNKB = 'RNKB'
    ROSBANK = 'ROSBANK'
    ROSSELKHOZ = 'ROSSELKHOZ'
    ROUNDBANK = 'ROUNDBANK'
    RUSSTANDARD = 'RUSSTANDARD'
    SBERBANK = 'SBERBANK'
    SKB = 'SKB'
    SOVCOMBANK = 'SOVCOMBANK'
    SPBBANK = 'SPBBANK'
    SWEDBANK = 'SWEDBANK'
    TINKOFF = 'TINKOFF'
    UBRR = 'UBRR'
    UNICREDIT = 'UNICREDIT'
    URALSIB = 'URALSIB'
    VBRR = 'VBRR'
    VOZROZHDENIE = 'VOZROZHDENIE'
    VTB = 'VTB'
    YOOMONEY = 'YOOMONEY'


@unique
class CardNetwork(Enum):
    AMEX = 'AMEX'
    DISCOVER = 'DISCOVER'
    JCB = 'JCB'
    MASTERCARD = 'MASTERCARD'
    MAESTRO = 'MAESTRO'
    VISAELECTRON = 'VISAELECTRON'
    VISA = 'VISA'
    MIR = 'MIR'
    UNIONPAY = 'UNIONPAY'
    UZCARD = 'UZCARD'
    HUMOCARD = 'HUMOCARD'
    UNKNOWN = 'UNKNOWN'
    UNDEFINED = 'UNDEFINED'  # reason: https://st.yandex-team.ru/YANDEXPAY-2687

    @classmethod
    def from_tsp_type(cls, tsp_type: TSPType) -> 'CardNetwork':
        if tsp_type == TSPType.VISA:
            return CardNetwork.VISA
        if tsp_type == TSPType.MASTERCARD:
            return CardNetwork.MASTERCARD

        return CardNetwork.UNKNOWN

    @classmethod
    def from_trust_string(cls, value: str) -> 'CardNetwork':
        value = value.upper()
        if value in trust_payment_system_to_card_network_map:
            return trust_payment_system_to_card_network_map[value]

        return CardNetwork.UNKNOWN


# ключи взяли из trust-frontend
trust_payment_system_to_card_network_map: Dict[str, CardNetwork] = {
    'VISA': CardNetwork.VISA,
    'MASTERCARD': CardNetwork.MASTERCARD,
    'MIR': CardNetwork.MIR,
    'VISAELECTRON': CardNetwork.VISAELECTRON,
    'MAESTRO': CardNetwork.MAESTRO,
    'MASTERCARDELITE': CardNetwork.MASTERCARD,
    'AMERICANEXPRESS': CardNetwork.AMEX,
    'DISCOVER': CardNetwork.DISCOVER,
    'JCB': CardNetwork.JCB,
    'UNIONPAY': CardNetwork.UNIONPAY,
    'UZCARD': CardNetwork.UZCARD,
}


@unique
class AuthMethod(Enum):
    PAN_ONLY = 'PAN_ONLY'
    CLOUD_TOKEN = 'CLOUD_TOKEN'


@unique
class OperationStatus(Enum):
    PENDING = 'pending'
    SUCCESS = 'success'
    FAIL = 'fail'


@unique
class OperationType(Enum):
    AUTHORIZE = 'authorize'
    REFUND = 'refund'
    CAPTURE = 'capture'
    VOID = 'void'


class YandexPayAdminInternalEventType(Enum):
    FIRST_TRANSACTION = 'FIRST_TRANSACTION'
