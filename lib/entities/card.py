from dataclasses import dataclass, field

from pay.lib.entities.enums import CardNetwork, IssuerBank


@dataclass
class ExpirationDate:
    month: int
    year: int


@dataclass
class Card:
    card_id: str
    last4: str
    card_network: CardNetwork = field(metadata=dict(by_value=True))
    issuer_bank: IssuerBank = field(metadata=dict(by_value=True))
    expiration_date: ExpirationDate
    trust_card_id: str
