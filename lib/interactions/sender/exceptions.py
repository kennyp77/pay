from sendr_interactions.exceptions import InteractionResponseError


class SenderResponseError(InteractionResponseError):
    pass


class SenderMessageNotFoundError(SenderResponseError):
    pass
