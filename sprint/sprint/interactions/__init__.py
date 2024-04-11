import sendr_interactions

from pay.sprint.sprint.interactions.base import BaseInteractionClient


class InteractionClients(sendr_interactions.InteractionClients):
    abstract_client_class = BaseInteractionClient
