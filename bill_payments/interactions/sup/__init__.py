from sendr_interactions.clients.sup import AbstractSUPClient

from pay.bill_payments.bill_payments.conf import settings
from pay.bill_payments.bill_payments.interactions.base import BaseInteractionClient


class SUPClient(BaseInteractionClient, AbstractSUPClient):
    BASE_URL = settings.SUP_API_URL
    OAUTH_TOKEN = settings.SUP_OAUTH_TOKEN
