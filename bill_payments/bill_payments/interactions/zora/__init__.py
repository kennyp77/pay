from typing import ClassVar

from sendr_interactions.clients.zora import AbstractZoraClient
from sendr_tvm import qloud_async_tvm
from sendr_tvm.client.aiohttp import CachedTvmTicketGetter

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.interactions.base import BaseInteractionClient, ResponseType
from pay.bill_payments.bill_payments.utils.tvm import TVM_CONFIG


class BaseZoraClient(BaseInteractionClient[ResponseType], AbstractZoraClient):
    SERVICE = 'zora'

    ZORA_VERIFY_CERT: ClassVar[bool] = True
    ZORA_CLIENT_NAME: ClassVar[str] = settings.ZORA_CLIENT_NAME
    ZORA_TVM_ID: ClassVar[int] = settings.ZORA_TVM_ID
    ZORA_URL: ClassVar[str] = settings.ZORA_URL
    ZORA_ERROR_CODE_HEADER: ClassVar[str] = 'X-Yandex-Gozora-Error-Code'
    ZORA_ERROR_DESC_HEADER: ClassVar[str] = 'X-Yandex-Gozora-Error-Description'
    tvm_ticket_getter = CachedTvmTicketGetter(lambda: qloud_async_tvm.QTVM(**TVM_CONFIG))
