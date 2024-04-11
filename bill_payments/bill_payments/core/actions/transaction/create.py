from dataclasses import replace
from typing import Dict, List, NoReturn
from uuid import UUID, uuid4

import yenv

from pay.bill_payments.bill_payments.core.actions.base import BaseDBAction
from pay.bill_payments.bill_payments.core.entities.mpi_3ds_info import MPI3DSInfo
from pay.bill_payments.bill_payments.core.exceptions import (
    BillAlreadyPaidError,
    MixedDepartmentsError,
    OrderAlreadyPaidError,
    OrderNotFoundError,
    PaymentMethodNotSupportedError,
)
from pay.bill_payments.bill_payments.interactions.kazna.entities import (
    DepartmentType,
    DeviceChannel,
    MpiExtInfo,
    PaymentParams,
    PayRequest,
    PayType,
)
from pay.bill_payments.bill_payments.interactions.kazna.exceptions import KaznaAPIError, KaznaAPIErrorCode
from pay.bill_payments.bill_payments.storage.entities.bill_order import BillOrder
from pay.bill_payments.bill_payments.storage.entities.enums import PaymentMethodType, TransactionStatus
from pay.bill_payments.bill_payments.storage.entities.order import Order
from pay.bill_payments.bill_payments.storage.entities.transaction import PayerData, Transaction


class CreateTransactionAction(BaseDBAction):
    transact = True

    def __init__(
        self,
        uid: int,
        order_id: UUID,
        payment_method: PaymentMethodType,
        payer_full_name: str,
        payment_token: str,
        mpi_3ds_info: MPI3DSInfo,
        return_url: str,
    ):
        super().__init__()
        self.uid = uid
        self.order_id = order_id
        self.payment_method = payment_method
        self.payment_token = payment_token
        self.payer_full_name = payer_full_name
        self.mpi_3ds_info = mpi_3ds_info
        self.return_url = return_url

    def _exception_result(self, exc: Exception) -> NoReturn:
        if isinstance(exc, KaznaAPIError):
            code = exc.kazna_code
            self.logger.context_push(kazna_code=code)
            if code is None:
                self.logger.warning('Invalid kazna api code')
            else:
                if code == KaznaAPIErrorCode.PAYMENT_ALREADY_EXISTS:
                    raise BillAlreadyPaidError
                self.logger.warning('Unhandled kazna api code')
        super()._exception_result(exc)

    @staticmethod
    def _get_bill_ids(bill_orders: List[BillOrder]) -> List[str]:
        return [bill_order.bill.supplier_bill_id for bill_order in bill_orders]

    def _get_kazna_pay_type(self) -> PayType:
        try:
            return {
                PaymentMethodType.YANDEX_PAY: PayType.YANDEXPAY,
            }[self.payment_method]
        except KeyError:
            raise PaymentMethodNotSupportedError

    def _infer_dep_type(self, bill_orders: List[BillOrder]) -> DepartmentType:
        dep_types = set(bill_order.bill.dep_type for bill_order in bill_orders)
        if len(dep_types) > 1:
            self.logger.context_push(dep_types=dep_types)
            raise MixedDepartmentsError
        dep_type = dep_types.pop()
        if dep_type == DepartmentType.UNKNOWN and yenv.type in ('testing', 'development'):
            self.logger.warning('Dep type is unknown, falling back to GIBDD')
            return DepartmentType.GIBDD
        return dep_type

    @staticmethod
    def _get_amount(bill_orders: List[BillOrder]) -> int:
        """Полная сумма заказа с учётом комиссии"""
        amount = sum(bill_order.bill.discounted_amount + bill_order.bill.fee_amount for bill_order in bill_orders)
        return amount

    def _get_payment_params(self) -> Dict[str, str]:
        if self.payment_method == PaymentMethodType.YANDEX_PAY:
            return {'yp_token': self.payment_token}
        raise PaymentMethodNotSupportedError

    def _get_kazna_mpi_ext_info(self) -> MpiExtInfo:
        return MpiExtInfo(
            device_channel=DeviceChannel.BROWSER,
            browser_accept_header=self.mpi_3ds_info.browser_accept_header,
            browser_color_depth=self.mpi_3ds_info.browser_color_depth,
            browser_ip=self.mpi_3ds_info.browser_ip,
            browser_language=self.mpi_3ds_info.browser_language,
            browser_screen_height=self.mpi_3ds_info.browser_screen_height,
            browser_screen_width=self.mpi_3ds_info.browser_screen_width,
            browser_tz=self.mpi_3ds_info.browser_tz,
            browser_user_agent=self.mpi_3ds_info.browser_user_agent,
            browser_java_enabled=self.mpi_3ds_info.browser_javascript_enabled,
            window_width=self.mpi_3ds_info.window_width,
            window_height=self.mpi_3ds_info.window_height,
            # TODO: убрать эти два параметры, когда оплатагосуслуг научится их игнорировать
            notification_url='https://notification.invalid',
            tds_notification_url='https://tds.notification.invalid',
        )

    async def _check_existing_transactions(self, order_id: UUID) -> None:
        transactions = await self.storage.transaction.find_by_order_id(order_id=order_id, for_update=True)
        for transaction in transactions:
            if transaction.status not in (TransactionStatus.NEW, TransactionStatus.CANCELLED):
                raise OrderAlreadyPaidError
        for transaction in transactions:
            if transaction.status != TransactionStatus.CANCELLED:
                transaction = replace(transaction, status=TransactionStatus.CANCELLED)
                await self.storage.transaction.save(transaction)

    async def handle(self) -> Transaction:
        self.logger.context_push(
            order_id=self.order_id,
            payment_method=self.payment_method,
            mpi_3ds_info=self.mpi_3ds_info,
            return_url=self.return_url,
        )
        try:
            order = await self.storage.order.get_by_order_id_and_uid(
                uid=self.uid, order_id=self.order_id, for_update=True
            )
        except Order.DoesNotExist:
            raise OrderNotFoundError

        await self._check_existing_transactions(order.order_id)

        bill_orders = await self.storage.bill_order.find_by_order_id(order_id=order.order_id, include_bill=True)

        bill_ids = self._get_bill_ids(bill_orders)
        dep_type = self._infer_dep_type(bill_orders)
        amount = self._get_amount(bill_orders)
        payer_data = PayerData(payer_full_name=self.payer_full_name)

        transaction_id = uuid4()
        self.logger.context_push(transaction_id=transaction_id)

        payment = await self.clients.kazna.pay(
            PayRequest(
                order_id=str(transaction_id),
                kvit=False,
                dep_type=dep_type,
                payer_params=payer_data.to_kazna_payer_params(),
                payment_params=PaymentParams(supplier_bill_id=bill_ids),
                pay_type=self._get_kazna_pay_type(),
                amount=amount,
                mpi_ext_info=self._get_kazna_mpi_ext_info(),
                return_url=self.return_url,
                **self._get_payment_params(),  # type: ignore
            )
        )

        transaction = await self.storage.transaction.create(
            Transaction(
                transaction_id=transaction_id,
                order_id=order.order_id,
                status=TransactionStatus.NEW,
                amount=amount,
                external_payment_id=str(payment.payment_id),
                payer_data=payer_data,
                payment_method=self.payment_method,
            ),
        )

        self.logger.info('Transaction created')

        if payment.tds is not None:
            transaction.acs_url = payment.tds.to_url()

        return transaction
