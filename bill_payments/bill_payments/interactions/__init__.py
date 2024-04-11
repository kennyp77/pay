import sendr_interactions

from pay.bill_payments.bill_payments.interactions.base import BaseInteractionClient
from pay.bill_payments.bill_payments.interactions.kazna import KaznaClient
from pay.bill_payments.bill_payments.interactions.sup import SUPClient


class InteractionClients(sendr_interactions.InteractionClients):
    abstract_client_class = BaseInteractionClient

    kazna: KaznaClient
    sup: SUPClient
