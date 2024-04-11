import json
from base64 import b64encode
from decimal import Decimal
from typing import Any, Mapping, NoReturn, Optional, TypeVar, Union
from xml.etree.ElementTree import Element, ParseError

from aiohttp import ClientResponse, FormData
from defusedxml.ElementTree import XML

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag
from sendr_utils import without_none
from sendr_utils.schemas.base import BaseSchema

from pay.lib.entities.threeds import ThreeDS2AuthenticationRequest
from pay.lib.interactions.psp.payture.entities import (
    Block3DSV1Required,
    Block3DSV2Required,
    BlockSuccess,
    ChargeResult,
    Cheque,
    Order,
    PaytureAPICredentials,
    RefundResult,
    SuccessStatus,
    UnblockResult,
)
from pay.lib.interactions.psp.payture.exceptions import PaytureDataError
from pay.lib.interactions.psp.payture.schemas import (
    BlockResultSchema,
    BlockSuccessSchema,
    BrowserDataSchema,
    ChargeResultSchema,
    ChequeSchema,
    OrderSchema,
    RefundResultSchema,
    UnblockResultSchema,
)
from pay.lib.utils.currency import amount_to_minor_units

ResultType = TypeVar('ResultType')


class AbstractPaytureAPIClient(AbstractInteractionClient[Element]):
    """
    Документация: https://wiki.yandex-team.ru/yandexpay/psp/payture/
    """

    SERVICE = 'psp/payture'
    LOG_RESPONSE_BODY = LogFlag.ALWAYS

    @staticmethod
    def _encode_obj(obj: Any, schema: BaseSchema) -> str:
        data = schema.dump(obj).data
        return b64encode(json.dumps(data).encode('utf-8')).decode('ascii')

    async def mobile_block(
        self,
        credentials: PaytureAPICredentials,
        order_id: str,
        payment_token: str,
        amount: Decimal,
        user_ip: str,
        threeds_authentication_request: ThreeDS2AuthenticationRequest,
        is_checkout: bool = False,
        cheque: Optional[Cheque] = None,
    ) -> Union[BlockSuccess, Block3DSV1Required, Block3DSV2Required]:
        custom_fields = {
            'IP': user_ip,
            'ChallengeNotificationURL': threeds_authentication_request.challenge_notification_url,
        }
        if is_checkout:
            custom_fields['YaPayCheckout'] = '1'
        browser_data = self._encode_obj(threeds_authentication_request.browser_data, BrowserDataSchema())
        custom_fields['BrowserData'] = browser_data

        request_data = FormData(
            without_none(
                {
                    'Key': credentials.key,
                    'OrderId': order_id,
                    'PayToken': payment_token,
                    'Amount': amount_to_minor_units(amount=amount, currency='RUB'),
                    'CustomFields': self._to_semicolon_separated_formdata(custom_fields),
                    'Cheque': self._encode_obj(cheque, ChequeSchema()) if cheque else None,
                }
            )
        )

        response = await self.post(
            interaction_method='mobile_block',
            url=self.endpoint_url('/api/MobileBlock'),
            data=request_data,
        )

        return self._parse_response(response, BlockResultSchema())

    async def block_3ds(
        self,
        credentials: PaytureAPICredentials,
        order_id: str,
        pa_res: Optional[str] = None,
        cres: Optional[str] = None,
    ) -> BlockSuccess:
        assert pa_res is not None or cres is not None
        request_data = FormData(
            without_none(
                {
                    'Key': credentials.key,
                    'OrderId': order_id,
                    'PaRes': pa_res,
                    'CRes': cres,
                }
            )
        )

        response = await self.post(
            interaction_method='block_3ds',
            url=self.endpoint_url('/api/Block3DS'),
            data=request_data,
        )

        return self._parse_response(response, BlockSuccessSchema())

    async def charge(
        self,
        credentials: PaytureAPICredentials,
        order_id: str,
        amount: Optional[Decimal] = None,
        cheque: Optional[Cheque] = None,
    ) -> ChargeResult:
        request_data = FormData(
            without_none(
                {
                    'Key': credentials.key,
                    'OrderId': order_id,
                    'Amount': amount_to_minor_units(amount=amount, currency='RUB') if amount else None,
                    'Cheque': self._encode_obj(cheque, ChequeSchema()) if cheque else None,
                }
            )
        )

        response = await self.post(
            interaction_method='charge',
            url=self.endpoint_url('/api/Charge'),
            data=request_data,
        )

        return self._parse_response(response, ChargeResultSchema())

    async def unblock(self, credentials: PaytureAPICredentials, order_id: str) -> UnblockResult:
        request_data = FormData(
            without_none(
                {
                    'Key': credentials.key,
                    'OrderId': order_id,
                }
            )
        )

        response = await self.post(
            interaction_method='unblock',
            url=self.endpoint_url('/api/Unblock'),
            data=request_data,
        )

        return self._parse_response(response, UnblockResultSchema())

    async def refund(
        self,
        credentials: PaytureAPICredentials,
        order_id: str,
        amount: Optional[Decimal] = None,
        cheque: Optional[Cheque] = None,
    ) -> RefundResult:
        request_data = FormData(
            without_none(
                {
                    'Key': credentials.key,
                    'Password': credentials.password,
                    'OrderId': order_id,
                    'Amount': amount_to_minor_units(amount=amount, currency='RUB') if amount else None,
                    'Cheque': self._encode_obj(cheque, ChequeSchema()) if cheque else None,
                }
            )
        )

        response = await self.post(
            interaction_method='refund',
            url=self.endpoint_url('/api/Refund'),
            data=request_data,
        )

        return self._parse_response(response, RefundResultSchema())

    async def get_order(self, credentials: PaytureAPICredentials, order_id: str) -> Order:
        request_data = FormData(
            {
                'Key': credentials.key,
                'OrderId': order_id,
            }
        )

        response = await self.post(
            interaction_method='get_state',
            url=self.endpoint_url('/api/GetState'),
            data=request_data,
        )

        return self._parse_response(response, OrderSchema())

    async def _process_response(self, response: ClientResponse, interaction_method: str) -> Element:
        if response.status >= 400:
            await self._handle_response_error(response)
        try:
            data = XML(await response.text())
        except ParseError:
            await self._handle_response_error(response)

        if data.attrib.get('Success') == SuccessStatus.FAILURE.value:
            await self._handle_data_error(data=data, response=response)
        return data

    def _parse_response(self, response: Element, schema: BaseSchema) -> ResultType:
        response_data = self._xml_to_dict(response)
        unmarshal_result = schema.load(response_data)
        return unmarshal_result.data

    def _to_semicolon_separated_formdata(self, data: Mapping[str, str]) -> str:
        return ';'.join(f'{k}={v}' for k, v in data.items())

    def _xml_to_dict(self, data: Element) -> Mapping[str, Union[str, Mapping[str, str]]]:
        return dict(
            data.attrib.items(),
            AddInfo=dict([(item.attrib['Key'], item.attrib['Value']) for item in data.findall('AddInfo')]),
        )

    async def _handle_data_error(self, data: Element, response: ClientResponse) -> NoReturn:
        await self._try_log_error_response_body(response=response)
        error_code = data.attrib.get('ErrCode')
        raise PaytureDataError(
            response_status=error_code,
            status_code=response.status,
            method=response.method,
            service=self.SERVICE,
        )
