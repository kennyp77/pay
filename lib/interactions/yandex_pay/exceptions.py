from typing import Dict, Type

from sendr_interactions.exceptions import InteractionResponseError


class BaseYandexPayInteractionError(InteractionResponseError):
    pass


class CardNotFoundError(BaseYandexPayInteractionError):
    default_message = 'Card not found'


class UnknownYandexPayInteractionError(BaseYandexPayInteractionError):
    default_message = 'unknown yandex pay plus error'


_ERROR_CODE_TO_EXCEPTION: Dict[str, Type[BaseYandexPayInteractionError]] = {
    'CARD_NOT_FOUND': CardNotFoundError,
}


def get_exception_by_error_code(status: str) -> Type[BaseYandexPayInteractionError]:
    return _ERROR_CODE_TO_EXCEPTION.get(status, UnknownYandexPayInteractionError)
