import logging
import logging.config

from sendr_qlog import LoggerContext

from pay.bill_payments.bill_payments.conf import settings


def configure_logging():
    logging.config.dictConfig(settings.LOGGING)
    logging.root.setLevel(settings.LOG_LEVEL)


def get_product_logger() -> logging.Logger:
    """
    Продуктовый персистентный логгер, с другими настройками хранения (более долгосрочными)
    """
    return logging.getLogger(settings.LOG_PRODUCT_LOGGER_NAME)


class BillPaymentsLoggerContext(LoggerContext):
    def with_product_log(self):
        return self.with_logger(get_product_logger())
