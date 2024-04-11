import json
from decimal import Decimal
from typing import Any, Dict, NoReturn, Optional, TypeVar, Union

from aiohttp import ClientResponse, FormData

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag
from sendr_utils import without_none
from sendr_utils.schemas.base import BaseSchema

from pay.lib.interactions.psp.rbs.entities import (
    BaseRBSCredentials,
    Cart,
    Order,
    OrderBundle,
    PaymentResult3DSV1,
    PaymentResult3DSV2Challenge,
    PaymentResult3DSV2Fingerprinting,
    PaymentResultSuccess,
    RegisterResult,
)
from pay.lib.interactions.psp.rbs.exceptions import RBSDataError
from pay.lib.interactions.psp.rbs.schemas import (
    CartSchema,
    OrderBundleSchema,
    OrderSchema,
    PaymentResult3DSV1Schema,
    PaymentResult3DSV2ChallengeSchema,
    PaymentResult3DSV2FingerprintingSchema,
    RegisterResultSchema,
)
from pay.lib.utils.currency import ALPHA_TO_NUMERIC, amount_to_minor_units

ResultType = TypeVar('ResultType')


class AbstractRBSRestClient(AbstractInteractionClient[Dict[str, Any]]):
    """
    Документация: https://wiki.yandex-team.ru/yandexpay/psp/rbs/
    """

    SERVICE = 'psp/rbs'
    LOG_RESPONSE_BODY = LogFlag.ALWAYS

    INTERACTION_METHOD_REGISTER_PRE_AUTH = 'register_pre_auth'
    INTERACTION_METHOD_YANDEX_PAYMENT = 'yandex_payment'
    INTERACTION_METHOD_FINISH_3DS = 'finish_3ds'
    INTERACTION_METHOD_FINISH_3DSV2 = 'finish_3dsv2'
    INTERACTION_METHOD_DEPOSIT = 'deposit'
    INTERACTION_METHOD_REVERSE = 'reverse'
    INTERACTION_METHOD_REFUND = 'refund'
    INTERACTION_METHOD_GET_ORDER = 'get-order'

    async def register_pre_auth(
        self,
        base_url: str,
        credentials: BaseRBSCredentials,
        order_number: str,
        amount: Decimal,
        currency: str,
        user_ip: str,
        order_bundle: Optional[OrderBundle] = None,
    ) -> RegisterResult:
        request_data = FormData(
            without_none(
                {
                    'userName': credentials.username,
                    'password': credentials.password,
                    'orderNumber': order_number,
                    'currency': self.currency_iso4217_alpha3_to_numeric(currency),
                    'amount': amount_to_minor_units(amount=amount, currency=currency),
                    'returnUrl': 'https://return.invalid',
                    'failUrl': 'https://fail.invalid',
                    'orderBundle': self._to_json_str(OrderBundleSchema(), order_bundle) if order_bundle else None,
                }
            )
        )

        response = await self.post(
            interaction_method=self.INTERACTION_METHOD_REGISTER_PRE_AUTH,
            url=self.endpoint_url('/rest/registerPreAuth.do', base_url_override=base_url),
            data=request_data,
        )

        return self._parse_response(response, RegisterResultSchema())

    async def yandex_payment(
        self,
        base_url: str,
        credentials: BaseRBSCredentials,
        order_id: str,
        threeds2_challenge_notification_url: str,
        threeds2_method_notification_url: str,
        payment_token: str,
        threeds2_server_transaction_id: Optional[str] = None,
    ) -> Union[PaymentResultSuccess, PaymentResult3DSV1, PaymentResult3DSV2Fingerprinting, PaymentResult3DSV2Challenge]:
        request_data = {
            'username': credentials.username,
            'password': credentials.password,
            'orderId': order_id,
            'paymentToken': payment_token,
            'threeDSVer2FinishUrl': threeds2_challenge_notification_url,
            'threeDSMethodNotificationUrl': threeds2_method_notification_url,
        }
        if threeds2_server_transaction_id:
            request_data['threeDSServerTransId'] = threeds2_server_transaction_id

        response = await self.post(
            interaction_method=self.INTERACTION_METHOD_YANDEX_PAYMENT,
            url=self.endpoint_url('/yandex/payment.do', base_url_override=base_url),
            json=request_data,
        )
        response_data = response['data']
        if 'threeDSMethodURLServer' in response_data or 'threeDSMethodURL' in response_data:
            return self._parse_response(response_data, PaymentResult3DSV2FingerprintingSchema())
        if 'acsUrl' in response_data:
            if response_data.get('is3DSVer2', False):
                return self._parse_response(response_data, PaymentResult3DSV2ChallengeSchema())
            return self._parse_response(response_data, PaymentResult3DSV1Schema())
        return PaymentResultSuccess()

    async def finish_3ds(
        self,
        base_url: str,
        credentials: BaseRBSCredentials,
        md: str,
        pa_res: str,
    ) -> None:
        request_data = FormData(
            {
                'userName': credentials.username,
                'password': credentials.password,
                'mdOrder': md,
                'paRes': pa_res,
            }
        )

        await self.post(
            interaction_method=self.INTERACTION_METHOD_FINISH_3DS,
            url=self.endpoint_url('/rest/finish3dsPayment.do', base_url_override=base_url),
            data=request_data,
        )

    async def finish_3ds_ver2(
        self,
        base_url: str,
        credentials: BaseRBSCredentials,
        threeds_server_transaction_id: str,
        order_id: str,
    ) -> None:
        request_data = FormData(
            {
                'userName': credentials.username,
                'password': credentials.password,
                'threeDSServerTransId': threeds_server_transaction_id,
                'mdOrder': order_id,
            }
        )

        await self.post(
            interaction_method=self.INTERACTION_METHOD_FINISH_3DSV2,
            url=self.endpoint_url('/rest/finish3dsVer2Payment.do', base_url_override=base_url),
            data=request_data,
        )

    async def deposit(
        self,
        base_url: str,
        credentials: BaseRBSCredentials,
        order_id: str,
        currency: str,
        amount: Decimal = Decimal('0'),
        deposit_items: Optional[Cart] = None,
    ) -> None:
        """
        * amount - если указан 0, то списание на полную сумму
        """
        request_data = FormData(
            {
                'userName': credentials.username,
                'password': credentials.password,
                'orderId': order_id,
                'amount': amount_to_minor_units(amount=amount, currency=currency),
            }
        )
        if deposit_items:
            request_data.add_field('depositItems', self._to_json_str(CartSchema(), deposit_items))

        await self.post(
            interaction_method=self.INTERACTION_METHOD_DEPOSIT,
            url=self.endpoint_url('/rest/deposit.do', base_url_override=base_url),
            data=request_data,
        )

    async def reverse(
        self,
        base_url: str,
        credentials: BaseRBSCredentials,
        order_id: str,
    ) -> None:
        request_data = FormData(
            {
                'userName': credentials.username,
                'password': credentials.password,
                'orderId': order_id,
            }
        )

        await self.post(
            interaction_method=self.INTERACTION_METHOD_REVERSE,
            url=self.endpoint_url('/rest/reverse.do', base_url_override=base_url),
            data=request_data,
        )

    async def refund(
        self,
        base_url: str,
        credentials: BaseRBSCredentials,
        order_id: str,
        amount: Decimal,
        currency: str,
        refund_items: Optional[Cart] = None,
    ) -> None:
        request_data = FormData(
            {
                'userName': credentials.username,
                'password': credentials.password,
                'orderId': order_id,
                'amount': amount_to_minor_units(amount=amount, currency=currency),
            }
        )
        if refund_items:
            request_data.add_field('refundItems', self._to_json_str(CartSchema(), refund_items))

        await self.post(
            interaction_method=self.INTERACTION_METHOD_REFUND,
            url=self.endpoint_url('/rest/refund.do', base_url_override=base_url),
            data=request_data,
        )

    async def get_order(self, base_url: str, credentials: BaseRBSCredentials, order_id: str) -> Order:
        request_data = FormData(
            {
                'userName': credentials.username,
                'password': credentials.password,
                'orderId': order_id,
            }
        )

        response_data = await self.post(
            interaction_method=self.INTERACTION_METHOD_GET_ORDER,
            url=self.endpoint_url('/rest/getOrderStatusExtended.do', base_url_override=base_url),
            data=request_data,
        )
        return self._parse_response(response_data, OrderSchema())

    async def _process_response(self, response: ClientResponse, interaction_method: str) -> Dict[str, Any]:
        if response.status >= 400:
            await self._handle_response_error(response)
        data = await response.json(content_type=None)  # Частенько в ответе встречается text/plain

        error_code: Optional[str] = None
        error_reason: Optional[str] = None
        if interaction_method == self.INTERACTION_METHOD_YANDEX_PAYMENT:
            error = data.get('error', {})
            error_code = error.get('code')
            error_reason = error.get('message')
        else:
            error_code = data.get('errorCode')
            error_reason = data.get('errorMessage')
        if error_code is not None and (error_code_int := int(error_code)) > 0:
            assert error_reason is not None
            await self._handle_rbs_error(error_code=error_code_int, error_reason=error_reason, response=response)
        return data

    async def _handle_rbs_error(self, error_code: int, error_reason: str, response: ClientResponse) -> NoReturn:
        await self._try_log_error_response_body(response=response)
        raise RBSDataError(
            response_status=str(error_code),
            status_code=response.status,
            method=response.method,
            service=self.SERVICE,
            params={
                'reason': error_reason,
            },
        )

    def _parse_response(self, response: Dict[str, Any], schema: BaseSchema) -> ResultType:
        unmarshal_result = schema.load(response)
        return unmarshal_result.data

    def _to_json_str(self, schema: BaseSchema, data: Any) -> str:
        return json.dumps(schema.dump(data).data, separators=(',', ':'))

    @classmethod
    def currency_iso4217_alpha3_to_numeric(cls, alpha3: str) -> str:
        return ALPHA_TO_NUMERIC[alpha3]
