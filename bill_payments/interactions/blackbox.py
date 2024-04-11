from sendr_interactions.clients.blackbox import AbstractBlackBoxClient

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.interactions.base import BaseInteractionClient


class BlackBoxClient(BaseInteractionClient, AbstractBlackBoxClient):
    BASE_URL = settings.BLACKBOX_API_URL
    TVM_ID = settings.BLACKBOX_TVM_ID
    REQUEST_TIMEOUT = settings.BLACKBOX_REQUEST_TIMEOUT
