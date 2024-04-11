from typing import Dict, Type

from sendr_interactions.exceptions import InteractionResponseError


class YandexSplitResponseError(InteractionResponseError):
    pass


class YandexSplitNoPlansAvailableError(YandexSplitResponseError):
    pass


_ERROR_CODE_TO_EXCEPTION: Dict[str, Type[YandexSplitResponseError]] = {
    'no_plans_available': YandexSplitNoPlansAvailableError,
}


def get_exception_by_code(code: str) -> Type[YandexSplitResponseError]:
    return _ERROR_CODE_TO_EXCEPTION.get(code, YandexSplitResponseError)
