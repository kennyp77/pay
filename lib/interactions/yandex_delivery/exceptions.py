from typing import Dict, Optional, Tuple, Type, Union

from sendr_interactions.exceptions import InteractionResponseError


class BaseYandexDeliveryInteractionError(InteractionResponseError):
    @property
    def api_error_code(self) -> Optional[str]:
        return self.params.get('code')

    @property
    def api_error_message(self) -> Optional[str]:
        return self.params.get('message')


class UnauthorizedInteractionError(BaseYandexDeliveryInteractionError):
    pass


class BadRequestInteractionError(BaseYandexDeliveryInteractionError):
    pass


class UnknownInteractionError(BaseYandexDeliveryInteractionError):
    pass


class CancelNotAvailableInteractionError(BaseYandexDeliveryInteractionError):
    pass


InteractionMethod = str
ErrorCode = str

ErrorDescriptor = Union[ErrorCode, Tuple[InteractionMethod, ErrorCode]]


_ERROR_DESC_TO_EXCEPTION: Dict[ErrorDescriptor, Type[BaseYandexDeliveryInteractionError]] = {
    'unauthorized': UnauthorizedInteractionError,
    '400': BadRequestInteractionError,
    'free_cancel_is_unavailable': CancelNotAvailableInteractionError,
    ('cancel_claim', 'inappropriate_status'): CancelNotAvailableInteractionError,
}


def get_exception_by_error_descriptor(error_descriptor: ErrorDescriptor) -> Type[BaseYandexDeliveryInteractionError]:
    if cls := _ERROR_DESC_TO_EXCEPTION.get(error_descriptor):
        return cls
    if isinstance(error_descriptor, tuple):
        if cls := _ERROR_DESC_TO_EXCEPTION.get(error_descriptor[1]):
            return cls
    return UnknownInteractionError
