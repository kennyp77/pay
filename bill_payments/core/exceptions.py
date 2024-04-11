from uuid import UUID

from sendr_core.exceptions import BaseCoreError, CoreFailError  # noqa


class CoreErrorWithMessage(BaseCoreError):
    message = 'CORE_ERROR'


class CoreNotFoundError(CoreErrorWithMessage):
    message = 'NOT_FOUND'


class CoreDataError(CoreErrorWithMessage):
    message = 'DATA_ERROR'


class CoreAlreadyExistsError(CoreErrorWithMessage):
    message = 'ALREADY_EXISTS'


class DocumentNotFoundError(CoreNotFoundError):
    message = 'DOCUMENT_NOT_FOUND'


class TransactionNotFoundError(CoreNotFoundError):
    message = 'TRANSACTION_NOT_FOUND'


class BillOrderNotFoundError(CoreNotFoundError):
    message = 'ORDER_NOT_FOUND'


class TooManyDocumentsError(CoreDataError):
    message = 'TOO_MANY_DOCUMENTS'

    def __init__(self, limit: int):
        super().__init__()
        self.params = {
            'limit': limit,
        }


class UserAlreadyExistsError(CoreAlreadyExistsError):
    message = 'USER_ALREADY_EXISTS'


class UserNotFoundError(CoreNotFoundError):
    message = 'USER_NOT_FOUND'


class PaymentMethodNotSupportedError(CoreDataError):
    message = 'PAYMENT_METHOD_NOT_SUPPORTED'


class MixedDepartmentsError(CoreDataError):
    message = 'MIXED_DEPARTMENTS'


class BillNotFoundError(CoreNotFoundError):
    message = 'BILL_NOT_FOUND'

    def __init__(self, bill_id: UUID):
        super().__init__()
        self.bill_id = bill_id
        self.params = {
            'bill_id': str(self.bill_id),
        }


class BillAlreadyPaidError(CoreDataError):
    message = 'BILL_ALREADY_PAID'


class OrderAlreadyPaidError(CoreDataError):
    message = 'ORDER_ALREADY_PAID'


class OrderNotFoundError(CoreNotFoundError):
    message = 'ORDER_NOT_FOUND'
