from json import JSONDecodeError
from typing import Any, ClassVar, Dict, Generic, List, Optional, Type, TypeVar

from aiohttp import ClientResponse, ContentTypeError

from sendr_interactions import AbstractInteractionClient

from pay.lib.interactions.passport_addresses import exceptions
from pay.lib.interactions.passport_addresses.entities import Address, Contact
from pay.lib.interactions.passport_addresses.schemas import AddressSchema, ContactSchema
from pay.lib.schemas.base import BaseDataClassSchema

EntityType = TypeVar('EntityType')
SchemaType = TypeVar('SchemaType', bound=BaseDataClassSchema)


class BaseAbstractPassportCrudClient(Generic[EntityType, SchemaType], AbstractInteractionClient[Dict[str, Any]]):
    """
    Документация: https://wiki.yandex-team.ru/passport/address/
    """

    entity_name: ClassVar[str]

    @property
    def schema(self) -> Type[SchemaType]:
        raise NotImplementedError

    async def _handle_response_error(self, response: ClientResponse) -> None:
        try:
            data = await response.json()
        except (JSONDecodeError, ContentTypeError):
            return await super()._handle_response_error(response)

        await self._try_log_error_response_body(response)
        exception_cls = exceptions.get_exception_by_code(response.status)
        raise exception_cls(
            status_code=response.status,
            method=response.method,
            service=self.SERVICE,
            params=data,
        )

    def endpoint_url(self, relative_url: str, base_url_override: Optional[str] = None) -> str:
        return super().endpoint_url(f'{self.entity_name}/{relative_url}', base_url_override)

    @property
    def list_key(self):
        suffix = 'es' if self.entity_name.endswith('s') else 's'
        return f'{self.entity_name}{suffix}'

    async def list(
        self,
        uid: int,
        locale: Optional[str] = None,
        user_ticket: Optional[str] = None,
    ) -> List[EntityType]:
        params = {
            'user_id': uid,
            'user_type': 'uid',
        }
        if locale:
            params['locale'] = locale
        response = await self.get(
            interaction_method='list',
            url=self.endpoint_url('list'),
            params=params,
            user_ticket=user_ticket,
        )

        return self.schema().load_many(response[self.list_key])

    async def get_by_id(
        self,
        uid: int,
        entity_id: str,
        user_ticket: Optional[str] = None,
        locale: Optional[str] = None,
    ) -> EntityType:
        params = {
            'user_id': uid,
            'user_type': 'uid',
            'id': entity_id,
        }
        if locale:
            params['locale'] = locale
        response = await self.get(
            interaction_method='get_by_id',
            url=self.endpoint_url('get'),
            params=params,
            user_ticket=user_ticket,
        )

        return self.schema().load_one(response)

    async def create(self, uid: int, entity: EntityType, user_ticket: Optional[str] = None) -> EntityType:
        params = {
            'user_id': uid,
            'user_type': 'uid',
        }
        response = await self.post(
            interaction_method='create',
            url=self.endpoint_url('create'),
            params=params,
            user_ticket=user_ticket,
            json=self.schema().dump(entity).data,
        )

        return self.schema().load_one(response)

    async def update(
        self,
        uid: int,
        entity_id: str,
        entity: EntityType,
        user_ticket: Optional[str] = None,
    ) -> EntityType:
        params = {
            'user_id': uid,
            'user_type': 'uid',
            'id': entity_id,
        }
        response = await self.post(
            interaction_method='update',
            url=self.endpoint_url('update'),
            params=params,
            user_ticket=user_ticket,
            json=self.schema().dump(entity).data,
        )

        return self.schema().load_one(response)

    async def remove(self, uid: int, entity_id: str, user_ticket: Optional[str] = None) -> None:
        params = {
            'user_id': uid,
            'user_type': 'uid',
            'id': entity_id,
        }
        await self.get(
            interaction_method='remove',
            url=self.endpoint_url('delete'),
            params=params,
            user_ticket=user_ticket,
        )


class AbstractPassportAddressesClient(BaseAbstractPassportCrudClient[Address, AddressSchema]):
    SERVICE = 'passport_addresses'
    entity_name = 'address'

    @property
    def schema(self) -> Type[AddressSchema]:
        return AddressSchema


class AbstractPassportContactsClient(BaseAbstractPassportCrudClient[Contact, ContactSchema]):
    SERVICE = 'passport_contacts'
    entity_name = 'contact'

    @property
    def schema(self) -> Type[ContactSchema]:
        return ContactSchema
