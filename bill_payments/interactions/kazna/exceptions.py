from enum import Enum, unique
from typing import Optional

from sendr_interactions.exceptions import InteractionResponseError


@unique
class KaznaAPIErrorCode(Enum):
    PAYMENT_ALREADY_EXISTS = 106
    INVALID_SIGN = 104


class BaseKaznaInteractionError(InteractionResponseError):
    pass


class KaznaRequestValidationError(BaseKaznaInteractionError):
    pass


class KaznaAPIError(BaseKaznaInteractionError):
    @property
    def kazna_code(self) -> Optional[KaznaAPIErrorCode]:
        code = self.params.get('code')
        if code is not None:
            try:
                return KaznaAPIErrorCode(code)
            except (TypeError, ValueError):
                return None
        return None
