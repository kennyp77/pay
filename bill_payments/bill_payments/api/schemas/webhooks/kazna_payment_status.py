from dataclasses import dataclass
from hashlib import md5
from hmac import compare_digest
from typing import Any, Dict, Optional

from marshmallow.fields import String

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.interactions.kazna.entities import PaymentInfoResponse
from pay.bill_payments.bill_payments.interactions.kazna.schemas import PaymentInfoResponseSchema


@dataclass
class WebhookPaymentInfoRequest(PaymentInfoResponse):
    sign: Optional[str] = None

    def check_signature(self) -> bool:
        # NOTE: используется KAZNA_TOKEN, а не KAZNA_SALT. Так и должно быть.
        # Хоть может показаться странным: вроде токен в заголовках используется, а соль в подписи. Но нет.
        digest = filter(
            lambda x: x,
            [settings.KAZNA_TOKEN, str(self.payment_id), self.status.name],
        )
        sign = md5(''.join(digest).encode('utf-8')).hexdigest()
        assert self.sign
        return compare_digest(sign, self.sign)


class KaznaPaymentStatusSchema(PaymentInfoResponseSchema):
    sign = String(required=True)

    def create_data_class_instance(self, loaded_data: Dict[str, Any]) -> WebhookPaymentInfoRequest:
        return WebhookPaymentInfoRequest(**loaded_data)
