class InvalidYandexDeliveryOptionError(Exception):
    def __init__(self, description: str):
        super().__init__(description)
        self.description = description
