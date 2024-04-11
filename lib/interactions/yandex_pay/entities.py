from dataclasses import dataclass

from pay.lib.entities.enums import CardNetwork


@dataclass
class PaymentMethodInfo:
    card_last4: str
    card_network: CardNetwork


@dataclass
class CreatePaymentTokenResponse:
    payment_token: str
    message_id: str
    payment_method_info: PaymentMethodInfo
