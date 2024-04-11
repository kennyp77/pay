from typing import Any, Dict, Optional

from sendr_interactions.exceptions import InteractionResponseError


class MerchantResponseError(InteractionResponseError):
    pass


class MerchantAPIMalformedResponseError(MerchantResponseError):
    def __init__(
        self,
        *,
        validation_errors: Dict[str, Any],
        service: str,
    ):
        super().__init__(service=service, status_code=0, method='')
        self.params: Dict[str, Any] = self.params or {}
        self.params['validation_errors'] = validation_errors

    @property
    def validation_errors(self) -> Dict[str, Any]:
        return self.params['validation_errors']


class MerchantAPIResponseError(MerchantResponseError):
    def __init__(
        self,
        *,
        status_code: int,
        method: str,
        service: str,
        reason_code: str,
        reason: Optional[str],
    ):
        super().__init__(
            status_code=status_code,
            method=method,
            service=service,
            params=dict(reason_code=reason_code),
            message=reason,
        )

    @property
    def reason_code(self) -> str:
        return self.params.get('reason_code', 'OTHER')

    @property
    def reason(self) -> Optional[str]:
        return self.message
