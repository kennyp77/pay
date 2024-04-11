import logging
import logging.config

from pay.sprint.sprint.conf import settings


def configure_logging():
    logging.config.dictConfig(settings.LOGGING)
    logging.root.setLevel(settings.LOG_LEVEL)
