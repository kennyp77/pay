from sendr_aiohttp import PrefixedUrl

from pay.bill_payments.bill_payments.api.handlers.bill import BillsHandler
from pay.bill_payments.bill_payments.api.handlers.document import DocumentHandler
from pay.bill_payments.bill_payments.api.handlers.documents import DocumentsHandler
from pay.bill_payments.bill_payments.api.handlers.orders import OrdersHandler
from pay.bill_payments.bill_payments.api.handlers.search_bills import SearchBillsHandler
from pay.bill_payments.bill_payments.api.handlers.transaction import TransactionHandler
from pay.bill_payments.bill_payments.api.handlers.transactions import TransactionsHandler


class Url(PrefixedUrl):
    PREFIX = '/api/v1'


EXTERNAL_ROUTES = (
    Url(r'/documents', DocumentsHandler, name='external_v1_documents'),
    Url(r'/documents/{document_id:[^/]+}', DocumentHandler, name='external_v1_document'),
    Url(r'/bills', BillsHandler, name='external_v1_bills'),
    Url(r'/search/bills', SearchBillsHandler, name='external_v1_search_bills'),
    Url(r'/orders', OrdersHandler, name='external_v1_orders'),
    Url(r'/orders/{order_id:[^/]+}/transactions', TransactionsHandler, name='external_v1_transactions'),
    Url(r'/transactions/{transaction_id:[^/]+}', TransactionHandler, name='external_v1_transaction'),
)
