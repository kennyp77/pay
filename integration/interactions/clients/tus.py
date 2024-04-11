from dataclasses import dataclass
from enum import Enum, unique
from typing import Any, Dict
from marshmallow_dataclass import class_schema

from pay.integration.conf import settings
from pay.integration.interactions.base import BaseInteractionClient


@dataclass
class Account:
    login: str
    password: str
    uid: int


@dataclass
class GetAccountResponse:
    account: Account
    passport_environment: str


@unique
class Env(Enum):
    PROD = 'prod'
    TEST = 'test'
    CORP = 'team'
    CORP_TEST = 'team-test'


class TUSClient(BaseInteractionClient[Dict[str, Any]]):
    """
    Test User Service
    API: https://wiki.yandex-team.ru/test-user-service/
    Офигеть какая удобная штука. Но пока полноты нету.
    """

    SERVICE = 'tus'
    BASE_URL = 'https://tus.yandex-team.ru'
    tus_consumer = settings.TUS_CONSUMER
    oauth_token = settings.TUS_OAUTH_TOKEN  # realm: yandex-team.ru

    async def get_account(self, uid: str, env: Env = Env.TEST) -> GetAccountResponse:
        resp = await self.get(
            'get_account',
            self.endpoint_url('/1/get_account/'),
            params={'tus_consumer': self.tus_consumer, 'uid': uid, 'env': env.value},
            headers={'Authorization': f'OAuth {self.oauth_token}'},
        )
        return self._load_object(
            data=resp,
            schema=class_schema(GetAccountResponse),
        )
