from dataclasses import dataclass, fields
from typing import Optional
from uuid import UUID

import aiopg

from pay.integration.interactions import InteractionClients
from pay.integration.interactions.entities import WebUser


@dataclass
class Card:
    card_id: Optional[str]
    pan: Optional[str]  # hazmat!
    comment: Optional[str] = None


@dataclass
class User:
    uid: int
    card: Card
    auth_cookies: Optional[dict] = None

    async def init(self, clients: InteractionClients) -> None:
        if self.auth_cookies is None:
            tus_resp = await clients.tus.get_account(uid=self.uid)
            signin_resp = await clients.passport_web.sign_in(
                login=tus_resp.account.login, password=tus_resp.account.password
            )
            self.auth_cookies = signin_resp.cookies

    def to_web_user(self) -> WebUser:
        assert self.auth_cookies is not None
        return WebUser(uid=self.uid, cookies=self.auth_cookies)


@dataclass
class Users:
    default: User
    rbs_3dsv1: User
    rbs_3dsv2_frictionless: User
    rbs_3dsv2_challenge: User
    rbs_non3ds: User
    mts_non3ds: User

    async def init(self, clients: InteractionClients) -> None:
        for field in fields(self):
            await getattr(self, field.name).init(clients)

    async def destroy(self):
        pass


@dataclass
class DB:
    connstr: str
    pool: Optional[aiopg.Pool] = None

    async def init(self) -> None:
        self.pool = await aiopg.create_pool(self.connstr)

    async def destroy(self):
        self.pool.close()
        await self.pool.wait_closed()


@dataclass
class Databases:
    async def init(self) -> None:
        for field in fields(self):
            await getattr(self, field.name).init()

    async def destroy(self):
        for field in fields(self):
            await getattr(self, field.name).destroy()


@dataclass
class Merchant:
    id: UUID
    callback_url: str
    api_key: str


@dataclass
class Merchants:
    payture_non3ds: Merchant
    alfabank: Merchant
    rbs_mts: Merchant
    uniteller: Merchant


@dataclass
class Catalog:
    db: Databases
    users: Users
    merchants: Merchants

    async def init(self, clients: InteractionClients) -> None:
        await self.db.init()
        await self.users.init(clients)

    async def destroy(self):
        await self.db.destroy()
        await self.users.destroy()
