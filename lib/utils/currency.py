from decimal import Decimal
from typing import Optional

from babel.numbers import get_currency_precision

from pay.lib.utils.exceptions import InvalidAmountError

# ISO 4217
ALPHA_TO_NUMERIC = {
    'AED': '784',
    'AMD': '051',
    'AUD': '036',
    'AZN': '944',
    'BGN': '975',
    'BRL': '986',
    'BYN': '933',
    'CAD': '124',
    'CHF': '756',
    'CNY': '156',
    'CZK': '203',
    'EUR': '978',
    'GBP': '826',
    'GEL': '981',
    'HKD': '344',
    'INR': '356',
    'KGS': '417',
    'KZT': '398',
    'PLN': '985',
    'RON': '946',
    'RUB': '643',
    'SEK': '752',
    'TRY': '949',
    'UAH': '980',
    'USD': '840',
    'UZS': '860',
    'ZAR': '710',
}


def amount_to_minor_units(amount: Decimal, currency: Optional[str], min_allowed: Optional[int] = None) -> int:
    """
    Преобразует amount в целое число минимальных единиц валюты.

    https://en.wikipedia.org/wiki/ISO_4217#Minor_units_of_currency:
    "As of 2021, two currencies have non-decimal ratios,
    the Mauritanian ouguiya and the Malagasy ariary; in both cases the ratio is 5:1.
    [These] are technically divided into five subunits the coins display '1/5'
    on their face [...]; These are not used in practice, but when written out,
    a single significant digit is used. E.g. 1.2 UM."
    """
    currency_exponent = get_currency_precision(currency)
    normalized_amount = amount * 10**currency_exponent
    integral_amount = normalized_amount.to_integral_value()
    if normalized_amount != integral_amount:
        raise InvalidAmountError

    normalized = int(integral_amount)
    if min_allowed is not None and normalized < min_allowed:
        raise InvalidAmountError

    return normalized


def amount_from_minor_units(minor_units: int, currency: Optional[str]) -> Decimal:
    """
    Денормализация amount из минимальных единиц валюты в Decimal.
    """
    currency_exponent = get_currency_precision(currency)
    denormalized_amount = Decimal(minor_units) / Decimal(10**currency_exponent)
    return denormalized_amount
