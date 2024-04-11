from typing import Dict, Type

from sendr_interactions.exceptions import InteractionResponseError


class PassportAddressesResponseError(InteractionResponseError):
    pass


class PassportAddressesBadRequestError(PassportAddressesResponseError):
    pass


class PassportAddressesTooManyRequestsError(PassportAddressesResponseError):
    pass


class PassportAddressNotFoundError(PassportAddressesResponseError):
    pass


_CODE_TO_EXCEPTION: Dict[int, Type[PassportAddressesResponseError]] = {
    400: PassportAddressesBadRequestError,
    404: PassportAddressNotFoundError,
    429: PassportAddressesTooManyRequestsError,
}


def get_exception_by_code(code: int) -> Type[PassportAddressesResponseError]:
    return _CODE_TO_EXCEPTION.get(code, PassportAddressesResponseError)
