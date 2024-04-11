from dataclasses import dataclass
from typing import Dict

from aiohttp import ClientResponse

from pay.integration.interactions.base import BaseInteractionClient


@dataclass
class Account:
    login: str
    password: str
    uid: int


@dataclass
class SignInResponse:
    cookies: Dict[str, str]


class PassportWebClient(BaseInteractionClient[ClientResponse]):
    SERVICE = 'passport-web'
    BASE_URL = 'https://passport-test.yandex.ru'

    async def _process_response(self, response: ClientResponse, interaction_method: str) -> ClientResponse:
        return response

    async def sign_in(self, login: str, password: str) -> SignInResponse:
        """
        Нужно чтобы получить куку.
        Стремно выглядит, да? Ждём от TUS возможности получать куку.
        """
        self.session.cookie_jar.clear()
        resp = await self.post(
            'sign_in',
            self.endpoint_url('/auth'),
            data={
                'login': login,
                'passwd': password,
            },
            headers={'content-type': 'application/x-www-form-urlencoded; charset=utf-8'},
            allow_redirects=False,
        )
        cookies = {k: v.value for k, v in resp.cookies.items()}
        return SignInResponse(
            cookies=cookies,
        )
