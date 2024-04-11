import json
from base64 import b64encode
from decimal import Decimal
from hashlib import md5, sha256
from typing import Any, Callable, ClassVar, Dict, Mapping, NoReturn, Optional, Set, TypeVar, Union
from xml.etree.ElementTree import Element, ParseError

from aiohttp import ClientResponse, FormData
from defusedxml.ElementTree import XML

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag
from sendr_utils.schemas.base import BaseSchema

from pay.lib.entities.threeds import ThreeDS2AuthenticationRequest
from pay.lib.interactions.psp.uniteller.entities import (
    ChargeResult,
    Cheque,
    RefundResult,
    Result,
    ThreeDSV1Result,
    ThreeDSV2Result,
    UnitellerCredentials,
)
from pay.lib.interactions.psp.uniteller.exceptions import UnitellerDataError
from pay.lib.interactions.psp.uniteller.schemas import (
    BrowserDataSchema,
    ChargeResultSchema,
    ChequeSchema,
    RefundResultSchema,
    ResultSchema,
)

ResultType = TypeVar('ResultType')


class AbstractUnitellerAPIClient(AbstractInteractionClient[Element]):
    SERVICE = 'psp/uniteller'
    LOG_RESPONSE_BODY = LogFlag.ALWAYS

    # У юнителлера тестовые и продовые урлы существенно отличаются.
    # Отличаются не только не доменом, и даже не префиксом пути. И даже не суффиксом пути (не надейся).
    # Напр. на тесте FINISH_3DS_URL = 'https://upay.uniteller.ru/api/1/yandexpaytestFinish3DS'
    # а на проде FINISH_3DS_URL = 'https://upay.uniteller.ru/api/1/yandexpayFinish3DS'
    # Поэтому самый гибкий вариант - возможность задавать каждый из урлов явным образом.
    # Если я ошибаюсь, то можно будет обратно обобщить.
    # А может быть наоборот: окажется, что в одной среде придётся использовать разные урлы
    CHARGE_URL: ClassVar[str]
    FINISH_3DS_URL: ClassVar[str]
    CONFIRM_URL: ClassVar[str]
    REFUND_URL: ClassVar[str]

    CHARGE_RECEIPT_URL: ClassVar[str]
    FINISH_3DS_RECEIPT_URL: ClassVar[str]
    CONFIRM_RECEIPT_URL: ClassVar[str]
    REFUND_RECEIPT_URL: ClassVar[str]

    async def charge(
        self,
        credentials: UnitellerCredentials,
        order_id: str,
        payment_token: str,
        amount: Decimal,
        user_ip: str,
        threeds_authentication_request: ThreeDS2AuthenticationRequest,
        email: Optional[str] = None,
        hold: bool = False,
        cheque: Optional[Cheque] = None,
    ) -> Union[ChargeResult, ThreeDSV1Result, ThreeDSV2Result]:
        data = {
            'ShopID': credentials.gateway_merchant_id,
            'OrderID': order_id,
            'Subtotal': str(amount),
            'PaymentToken': payment_token,
            'Currency': 'RUB',
            'TermUrl': threeds_authentication_request.challenge_notification_url,
            'BrowserInfo': self._encode_obj(threeds_authentication_request.browser_data, BrowserDataSchema()),
            'ClientIp': user_ip,
            'IsPreAuth': '1' if hold else '0',
        }

        if cheque and credentials.send_receipt:
            cheque_encoded = b64encode(json.dumps(ChequeSchema().dump(cheque).data).encode('utf-8')).decode('utf-8')
            receipt_signature_data = {
                'ShopID': credentials.gateway_merchant_id,
                'OrderID': order_id,
                'Subtotal': str(amount),
                'Receipt': cheque_encoded,
            }
            data['Receipt'] = cheque_encoded
            data['ReceiptSignature'] = self._signature(
                receipt_signature_data,
                password=credentials.password,
                hash_func=sha256,
                delimiter='&',
                skipped_fields=set(),
            )

        if email is not None:
            data['Email'] = email

        data['Signature'] = self._signature(data, credentials.password)
        request_data = FormData(data)
        response = await self.post(
            interaction_method='charge',
            url=self.CHARGE_RECEIPT_URL if credentials.send_receipt else self.CHARGE_URL,
            data=request_data,
        )

        parsed: ChargeResult = self._parse_response(response, ChargeResultSchema())
        if parsed.result != 0:
            raise UnitellerDataError(
                response_status=str(parsed.result),
                status_code=200,
                message=parsed.error_message,
                method='charge',
                service=self.SERVICE,
            )

        return parsed

    async def confirm(
        self,
        credentials: UnitellerCredentials,
        order_id: str,
        amount: Optional[Decimal] = None,
    ) -> None:
        data = {
            'ShopID': credentials.gateway_merchant_id,
            'OrderID': order_id,
        }

        if amount:
            data['Subtotal'] = str(amount)

        data['Signature'] = self._signature(data, credentials.password)

        request_data = FormData(data)

        response = await self.post(
            interaction_method='confirm',
            url=self.CONFIRM_RECEIPT_URL if credentials.send_receipt else self.CONFIRM_URL,
            data=request_data,
        )

        parsed: Result = self._parse_response(response, ResultSchema())
        if parsed.result != 0:
            raise UnitellerDataError(
                response_status=str(parsed.result),
                status_code=200,
                message=parsed.error_message,
                method='confirm',
                service=self.SERVICE,
            )

    async def refund(
        self, credentials: UnitellerCredentials, order_id: str, amount: Optional[Decimal] = None
    ) -> RefundResult:
        # порядок полей важен, см. документацию
        data = {'OrderID': order_id, 'Shop_ID': credentials.gateway_merchant_id, 'Format': '3'}  # xml

        if amount:
            data['Subtotal_P'] = str(amount)

        data['Signature'] = self._signature(data, credentials.password, hash_func=sha256, delimiter='&')

        request_data = FormData(data)

        response = await self.post(
            interaction_method='refund',
            url=self.REFUND_RECEIPT_URL if credentials.send_receipt else self.REFUND_URL,
            data=request_data,
        )

        parsed = self._parse_refund_response(response)

        return parsed

    async def finish_3ds(self, credentials: UnitellerCredentials, payment_attempt_id: str, pa_res: str) -> ChargeResult:
        data = {
            'ShopID': credentials.gateway_merchant_id,
            'PaymentAttemptID': payment_attempt_id,
            'PaRes': pa_res,
        }

        data['Signature'] = self._signature(data, credentials.password)

        request_data = FormData(data)

        response = await self.post(
            interaction_method='finish_3ds',
            url=self.FINISH_3DS_RECEIPT_URL if credentials.send_receipt else self.FINISH_3DS_URL,
            data=request_data,
        )

        parsed: ChargeResult = self._parse_response(response, ChargeResultSchema())
        if parsed.result != 0:
            raise UnitellerDataError(
                response_status=str(parsed.result),
                status_code=200,
                message=parsed.error_message,
                method='finish_3ds',
                service=self.SERVICE,
            )

        return parsed

    @staticmethod
    def _encode_obj(obj: Any, schema: BaseSchema) -> str:
        data = schema.dump(obj).data
        return b64encode(json.dumps(data).encode('utf-8')).decode('ascii')

    def _signature(
        self,
        data: Dict[str, str],
        password: str,
        hash_func: Callable[..., Any] = md5,
        delimiter: str = '',
        skipped_fields: Optional[Set[str]] = None,
    ) -> str:
        if skipped_fields is None:
            skipped_fields = {'BrowserInfo', 'ClientIp', 'Language', 'ReceiptSignature', 'Receipt'}

        digests = []

        def hash(s: str) -> str:
            return hash_func(s.encode('utf-8')).hexdigest()

        for k, v in data.items():
            if k in skipped_fields:
                continue
            digests.append(hash(v))
        digests.append(hash(password))
        return hash(delimiter.join(digests)).upper()

    async def _process_response(self, response: ClientResponse, interaction_method: str) -> Element:
        if response.status >= 400:
            await self._handle_response_error(response)

        try:
            data = XML(await response.text())
        except ParseError:
            await self._handle_response_error(response)

        return data

    def _parse_response(self, response: Element, schema: BaseSchema) -> ResultType:
        response_data = self._uniteller_xml_response_to_dict(response)
        unmarshal_result = schema.load(response_data)
        return unmarshal_result.data

    def _parse_refund_response(self, response: Element) -> RefundResult:
        firstcode = response.attrib['firstcode']
        secondcode = response.attrib['secondcode']

        if firstcode != '':
            raise UnitellerDataError(
                response_status=firstcode,
                status_code=400,
                message=secondcode,
                method='refund',
                service=self.SERVICE,
            )

        first_order = response.findall('orders/order')[0]
        data = {item.tag: item.text for item in list(first_order)}
        unmarshal_result = RefundResultSchema().load(data)
        return unmarshal_result.data

    def _to_semicolon_separated_formdata(self, data: Mapping[str, str]) -> str:
        return ';'.join(f'{k}={v}' for k, v in data.items())

    def _uniteller_xml_response_to_dict(
        self, data: Element
    ) -> Mapping[str, Union[Optional[str], Mapping[str, Optional[str]]]]:
        r = data.find('ResultYandexPay')

        if not r:
            # @perseus некоторые ручки не Yandex Pay специфичные, поэтому данные достаем из верхнего блока
            r = data

        def text_or_default(node: Element, tag: str, default: Optional[str] = None) -> Optional[str]:
            f = node.find(tag)
            return f.text if f is not None else default

        d: Mapping[str, Union[Optional[str], Mapping[str, Optional[str]]]] = {
            'result': text_or_default(r, 'Result'),
            'error_message': text_or_default(r, 'ErrorMessage'),
            'auth_code': text_or_default(r, 'AuthCode'),
            'rrn': text_or_default(r, 'RRN'),
            'is_3ds': text_or_default(r, 'Is3DS', default='0'),
            'version_3ds': text_or_default(r, 'Version3DS', default='1'),
            'payment_attempt_id': text_or_default(r, 'PaymentAttemptID'),
            'acquirer_id': text_or_default(r, 'AcquirerID'),
            'comission': text_or_default(r, 'Comission'),
            'redirect_form': text_or_default(r, 'RedirectForm'),
        }

        redirect_params = r.find('RedirectParams')
        if redirect_params is not None:
            d['redirect_params'] = {  # type: ignore
                'acs_url': text_or_default(redirect_params, 'URL'),
                'pa_req': text_or_default(redirect_params, 'PaReq'),
                'term_url': text_or_default(redirect_params, 'TermUrl'),
                'md': text_or_default(redirect_params, 'MD'),
                'creq': text_or_default(redirect_params, 'creq'),
                'threeds_session_data': text_or_default(redirect_params, 'threeDSSessionData'),
            }

        return d

    async def _handle_data_error(self, data: Element, response: ClientResponse) -> NoReturn:
        await self._try_log_error_response_body(response=response)
        error_code = data.attrib.get('Result')
        message = data.attrib.get('ErrorMessage')
        raise UnitellerDataError(
            response_status=error_code,
            status_code=response.status,
            message=message,
            method=response.method,
            service=self.SERVICE,
        )
