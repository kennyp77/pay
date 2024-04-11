from sendr_aiohttp import PrefixedUrl

from pay.bill_payments.bill_payments.api.handlers.webhooks.kazna_bill import BillNotificationHandler
from pay.bill_payments.bill_payments.api.handlers.webhooks.kazna_payment_status import KaznaPaymentStatusHandler


class Url(PrefixedUrl):
    PREFIX = '/webhooks'


WEBHOOKS_ROUTES = (
    Url(r'/kazna/payment_status', KaznaPaymentStatusHandler, name='webhooks_kazna_payment_status_handler'),
    Url(r'/kazna/bill', BillNotificationHandler, name='webhooks_kazna_bill_notification_handler'),
)
