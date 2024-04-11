import sendr_interactions

from pay.integration.interactions.base import BaseInteractionClient
from pay.integration.interactions.clients.passport_web import PassportWebClient
from pay.integration.interactions.clients.tus import TUSClient
from pay.integration.interactions.clients.yandex_pay.checkout import YandexPayCheckoutClient
from pay.integration.interactions.clients.yandex_pay.merchant import YandexPayMerchantClient


class InteractionClients(sendr_interactions.InteractionClients):
    abstract_client_class = BaseInteractionClient

    passport_web: PassportWebClient
    tus: TUSClient
    yandex_pay_checkout: YandexPayCheckoutClient
    yandex_pay_merchant: YandexPayMerchantClient
