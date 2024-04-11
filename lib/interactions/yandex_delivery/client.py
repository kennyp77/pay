from dataclasses import dataclass
from json import JSONDecodeError
from typing import Any, Dict, List, Optional

from aiohttp import ClientResponse, ContentTypeError

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag

from pay.lib.entities.contact import Contact
from pay.lib.entities.enums import DeliveryCategory
from pay.lib.entities.shipping import Address, Location, ShippingWarehouse, YandexDeliveryOption
from pay.lib.interactions.yandex_delivery.entities import AcceptClaimResponse
from pay.lib.interactions.yandex_delivery.entities import Address as YDAddress
from pay.lib.interactions.yandex_delivery.entities import (
    CancelClaimResponse,
    CancelState,
    CheckPriceRequest,
    CheckPriceResponse,
    Claim,
    ClientRequirements,
)
from pay.lib.interactions.yandex_delivery.entities import Contact as YDContact
from pay.lib.interactions.yandex_delivery.entities import (
    Coordinates,
    CreateClaimRequest,
    DeliveryInterval,
    GetDeliveryMethodsResponse,
    Item,
)
from pay.lib.interactions.yandex_delivery.entities import Location as YDLocation
from pay.lib.interactions.yandex_delivery.entities import RoutePoint, RoutePointId, RoutePointType, SameDayData
from pay.lib.interactions.yandex_delivery.exceptions import get_exception_by_error_descriptor
from pay.lib.interactions.yandex_delivery.schemas import (
    AcceptClaimResponseSchema,
    CancelClaimResponseSchema,
    CheckPriceRequestSchema,
    CheckPriceResponseSchema,
    ClaimSchema,
    CreateClaimRequestSchema,
    GetDeliveryMethodsResponseSchema,
)


@dataclass
class CommonParams:
    language: str
    auth_token: str


class AbstractYandexDeliveryClient(AbstractInteractionClient[Dict[str, Any]]):
    SERVICE = 'yandex-delivery'
    LOG_RESPONSE_BODY = LogFlag.ON_ERROR

    async def _process_response(self, response: ClientResponse, interaction_method: str) -> Dict[str, Any]:
        if response.status >= 400:
            await self._handle_interaction_method_response_error(response, interaction_method)
        return await super()._process_response(response, interaction_method)

    async def _request(
        self,
        *args: Any,
        common_client_params: CommonParams,
        headers: Optional[Dict[str, str]] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        if headers is None:
            headers = {}
        headers['Accept-Language'] = common_client_params.language
        headers['Authorization'] = f'Bearer {common_client_params.auth_token}'
        return await super()._request(*args, headers=headers, **kwargs)

    async def _handle_interaction_method_response_error(
        self, response: ClientResponse, interaction_method: str
    ) -> None:
        try:
            resp_json = await response.json()
        except (JSONDecodeError, ContentTypeError):
            pass
        else:
            code = resp_json.get('code')
            message = resp_json.get('message')
            if code is not None:
                await self._try_log_error_response_body(response)
                exc_cls = get_exception_by_error_descriptor((interaction_method, code))
                raise exc_cls(
                    status_code=response.status,
                    method=response.method,
                    service=self.SERVICE,
                    params=resp_json,
                    message=message,
                )

    async def get_delivery_methods(
        self,
        auth_token: str,
        start_point: Location,
        language: str = 'en',
    ) -> GetDeliveryMethodsResponse:
        url = self.endpoint_url('v1/delivery-methods')

        response_data = await self.post(
            interaction_method='get_delivery_methods',
            url=url,
            json={
                'start_point': YDLocation.Schema()
                .dump({'latitude': start_point.latitude, 'longitude': start_point.longitude})
                .data,
            },
            common_client_params=CommonParams(
                auth_token=auth_token,
                language=language,
            ),
        )
        return GetDeliveryMethodsResponseSchema().load(response_data).data

    async def check_price(
        self,
        auth_token: str,
        items: List[Item],
        route_points: List[Location],
        language: str = 'en',
        same_day_delivery_interval: Optional[DeliveryInterval] = None,
    ) -> CheckPriceResponse:
        """
        same_day_delivery_interval нужно передать, если хочешь узнать цену для same_day_delivery
        Если его не передать, то будет вычислена цена для express доставки.
        Q: Если я хочу узнать цену для same day delivery, то какой именно интервал нужно передать?
        A:
        > @ivaxer: цена доставки будет одинаковой для любого same_day_delivery_interval
        > Поэтому нужно сходить в /delivery-methods, оттуда взять любой интервал из same_day_deliery.intervals
        > и передать его в check-price
        """
        assert len(route_points) >= 2
        url = self.endpoint_url('v1/check-price')

        request = CheckPriceRequest(
            items=items,
            route_points=[
                Coordinates(coordinates=YDLocation(latitude=x.latitude, longitude=x.longitude)) for x in route_points
            ],
            requirements=ClientRequirements(),
        )
        assert request.requirements is not None
        if same_day_delivery_interval is not None:
            request.requirements.same_day_data = SameDayData(
                delivery_interval=same_day_delivery_interval,
            )
        response_data = await self.post(
            interaction_method='check_price',
            url=url,
            json=CheckPriceRequestSchema().dump(request).data,
            common_client_params=CommonParams(
                auth_token=auth_token,
                language=language,
            ),
        )
        return CheckPriceResponseSchema().load(response_data).data

    async def create_claim(
        self,
        auth_token: str,
        request_id: str,
        items: List[Item],
        warehouse: ShippingWarehouse,
        shipping_address: Address,
        shipping_contact: Contact,
        delivery_option: YandexDeliveryOption,
        language: str = 'en',
    ) -> Claim:
        url = self.endpoint_url('v2/claims/create')
        request = CreateClaimRequest(
            items=items,
            route_points=[
                RoutePoint(
                    point_id=RoutePointId.SOURCE.value,
                    visit_order=1,
                    type=RoutePointType.SOURCE,
                    address=YDAddress.from_core_address(warehouse.address),
                    contact=YDContact.from_core_contact(warehouse.contact),
                ),
                RoutePoint(
                    point_id=RoutePointId.DESTINATION.value,
                    visit_order=2,
                    type=RoutePointType.DESTINATION,
                    address=YDAddress.from_core_address(shipping_address),
                    contact=YDContact.from_core_contact(shipping_contact),
                ),
            ],
            emergency_contact=YDContact.from_core_contact(warehouse.emergency_contact),
        )
        if delivery_option.category == DeliveryCategory.TODAY:
            assert delivery_option.from_datetime and delivery_option.to_datetime
            request.same_day_data = SameDayData(
                delivery_interval=DeliveryInterval(
                    from_=delivery_option.from_datetime,
                    to=delivery_option.to_datetime,
                )
            )

        response_data = await self.post(
            interaction_method='create_claim',
            url=url,
            json=CreateClaimRequestSchema().dump(request).data,
            params={'request_id': request_id},
            common_client_params=CommonParams(
                auth_token=auth_token,
                language=language,
            ),
        )

        return ClaimSchema().load(response_data).data

    async def get_claim(self, auth_token: str, claim_id: str, language: str = 'en') -> Claim:
        url = self.endpoint_url('v2/claims/info')

        response_data = await self.post(
            interaction_method='get_claim',
            url=url,
            params={'claim_id': claim_id},
            common_client_params=CommonParams(
                auth_token=auth_token,
                language=language,
            ),
        )

        return ClaimSchema().load(response_data).data

    async def accept_claim(
        self,
        auth_token: str,
        claim_id: str,
        version: int,
        language: str = 'en',
    ) -> AcceptClaimResponse:
        url = self.endpoint_url('v1/claims/accept')

        response_data = await self.post(
            interaction_method='accept_claim',
            url=url,
            params={'claim_id': claim_id},
            json={'version': version},
            common_client_params=CommonParams(
                auth_token=auth_token,
                language=language,
            ),
        )

        return AcceptClaimResponseSchema().load(response_data).data

    async def get_cancel_info(self, auth_token: str, claim_id: str, language: str = 'en') -> CancelState:
        url = self.endpoint_url('v2/claims/cancel-info')
        response_data = await self.post(
            interaction_method='get_cancel_info',
            url=url,
            params={'claim_id': claim_id},
            common_client_params=CommonParams(
                auth_token=auth_token,
                language=language,
            ),
        )
        return CancelState(response_data['cancel_state'])

    async def cancel_claim(
        self, auth_token: str, claim_id: str, version: int, cancel_state: CancelState, language: str = 'en'
    ) -> CancelClaimResponse:
        """
        cancel_state - ожидаемый cancel_state. Если передать free а заказ уже в paid, то упадёт. Если наоборот,
            то отмена произойдет успешно (ожидали платную но отмена всё-ещё бесплатная => можно отменить бесплатно)
        version - ничего не делает. Передавай на всякий случай, наверное. Бэк схавает любое число, но лучше передавай
            настоящую.
        """
        assert cancel_state != CancelState.UNAVAILABLE
        url = self.endpoint_url('v2/claims/cancel')
        response_data = await self.post(
            interaction_method='cancel_claim',
            url=url,
            params={'claim_id': claim_id},
            json={'version': version, 'cancel_state': cancel_state.value},
            common_client_params=CommonParams(
                auth_token=auth_token,
                language=language,
            ),
        )
        return CancelClaimResponseSchema().load(response_data).data
