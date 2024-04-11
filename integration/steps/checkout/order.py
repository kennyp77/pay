import pytest
import asyncio
from dataclasses import replace
from decimal import Decimal
from time import monotonic
from typing import Any, Union, Collection
from uuid import UUID, uuid4

from pay.lib.entities.cart import Cart, CartItem, CartTotal, ItemQuantity, ItemReceipt, Measurements
from pay.lib.entities.contact import Contact
from pay.lib.entities.operation import OperationStatus
from pay.lib.entities.order import PaymentMethod, PaymentMethodType
from pay.lib.entities.receipt import TaxType
from pay.lib.entities.threeds import ThreeDSBrowserDataPayload
from pay.integration.catalog import User, Merchant
from pay.integration.interactions import InteractionClients
from sendr_qlog import LoggerContext
from billing.yandex_pay_plus.yandex_pay_plus.core.entities.form_order import CreateMerchantOrderRequest
from billing.yandex_pay_plus.yandex_pay_plus.storage.entities.enums import TransactionStatus


CART_ITEMS = [
    CartItem(
        product_id='p1',
        quantity=ItemQuantity(count=Decimal('1')),
        receipt=ItemReceipt(tax=TaxType.VAT_20_120),
        total=Decimal('0.01'),
    ),
    CartItem(
        product_id='p2',
        quantity=ItemQuantity(count=Decimal('1')),
        title='Слон',
        total=Decimal('100.0'),
        measurements=Measurements(
            weight=1500,
            height=3.1,
            length=4.2,
            width=5.1,
        ),
        receipt=ItemReceipt(tax=TaxType.VAT_20_120, product_code=bytes.fromhex('fefefe'), excise=Decimal('1')),
    ),
    CartItem(
        product_id='p3',
        quantity=ItemQuantity(count=Decimal('10'), label='шт'),
        title='Моська',
        total=Decimal('249.99'),
        measurements=Measurements(
            weight=1500,
            height=3.1,
            length=4.2,
            width=5.1,
        ),
        receipt=ItemReceipt(tax=TaxType.VAT_20_120, product_code=bytes.fromhex('fefefe'), excise=Decimal('1')),
    ),
]


class OrderStepper:
    def __init__(self, user: User, merchant: Merchant, clients: InteractionClients, logger: LoggerContext):
        self.user = user
        self.merchant = merchant
        self.clients = clients
        self.logger = logger
        self._order = None
        self._transaction = None

    async def create_order(self, currency_code='XTS'):
        with pytest.allure.step('Create order'):
            resp = await self.clients.yandex_pay_checkout.create_order(
                request=CreateMerchantOrderRequest(
                    merchant_id=self.merchant.id,
                    currency_code=currency_code,
                    cart=Cart(
                        total=CartTotal(amount=sum(x.total for x in CART_ITEMS)),
                        items=CART_ITEMS,
                    ),
                    order_amount=sum(x.total for x in CART_ITEMS),
                    payment_method=PaymentMethod(
                        method_type=PaymentMethodType.CARD,
                    ),
                    billing_contact=Contact(email='devnull@yandex-team.ru'),
                ),
                pay_session_id=f'allure-{self.clients.yandex_pay_checkout.request_id}',
                user=self.user.to_web_user(),
            )
            self._order = resp['data']['order']
            return self._order

    async def create_transaction(self):
        with pytest.allure.step('Start transaction'):
            assert self._order is not None

            resp = await self.clients.yandex_pay_checkout.create_transaction(
                order_id=self._order.checkout_order_id,
                card_id=self.user.card.card_id,
                threeds_payload=ThreeDSBrowserDataPayload(
                    language='ru',
                    screen_height=1080,
                    screen_width=1920,
                    window_height=480,
                    window_width=640,
                    timezone=-180,
                    java_enabled=False,
                    screen_color_depth=24,
                ),
                user=self.user.to_web_user(),
            )
            self._transaction = resp['data']['transaction']
            return self._transaction

    async def wait_operation_status(
        self, operation_id: UUID, expected_status: OperationStatus, timeout: int = 20
    ) -> None:
        with pytest.allure.step(f'Wait operation status {expected_status.value}'):
            limit = monotonic() + timeout
            while monotonic() < limit:
                resp = await self.clients.yandex_pay_merchant.get_operation(
                    api_key=self.merchant.api_key,
                    operation_id=operation_id,
                )
                operation = resp['data']['operation']
                status = operation.status
                if status == expected_status:
                    self.logger.info('OPERATION_STATUS_EXPECTATION_FULFILLED')
                    return
                self.logger.debug('OPERATION_STATUS_EXPECTATION_PENDING: %s != %s' % (status, expected_status))
                await asyncio.sleep(min(1, limit - monotonic()))
            raise TimeoutError

    async def wait_transaction_status(
        self,
        expected_status: Union[TransactionStatus, Collection[TransactionStatus]],
        timeout: int = 20,
    ) -> dict[str, Any]:
        with pytest.allure.step(f'Wait transaction {expected_status.value}'):
            limit = monotonic() + timeout
            wtime = 1
            exp = 1.5
            while monotonic() < limit:
                resp = await self.clients.yandex_pay_checkout.get_transaction(
                    transaction_id=self._transaction.transaction_id, user=self.user.to_web_user()
                )
                updated_transaction = resp['data']['transaction']
                status = updated_transaction['status']
                if status == expected_status:
                    self.logger.info('TRANSACTION_STATUS_EXPECTATION_FULFILLED')
                    return updated_transaction
                self.logger.debug('TRANSACTION_STATUS_EXPECTATION_PENDING: %s != %s' % (status, expected_status))
                wtime *= exp
                await asyncio.sleep(min(wtime, limit - monotonic()))
            raise TimeoutError

    async def capture(self) -> UUID:
        with pytest.allure.step('Capture the order'):
            capture_op_id = uuid4()
            response = await self.clients.yandex_pay_merchant.capture(
                order_id=self._order.order_id,
                external_operation_id=capture_op_id,
                api_key=self.merchant.api_key,
            )
            return response['data']['operation']

    async def cancel(self) -> UUID:
        with pytest.allure.step('Cancel the order'):
            cancel_op_id = uuid4()
            response = await self.clients.yandex_pay_merchant.cancel(
                order_id=self._order.order_id,
                external_operation_id=cancel_op_id,
                reason='integration-test',
                api_key=self.merchant.api_key,
            )
            return response['data']['operation']

    async def refund(self) -> UUID:
        with pytest.allure.step('Refund the order'):
            refund_op_id = uuid4()
            items = [
                CART_ITEMS[1],
                replace(
                    CART_ITEMS[2],
                    quantity=ItemQuantity(count=Decimal('7'), label='шт'),
                    total=Decimal('174.99'),
                ),
            ]
            response = await self.clients.yandex_pay_merchant.refund(
                order_id=self._order.order_id,
                external_operation_id=refund_op_id,
                api_key=self.merchant.api_key,
                refund_amount=sum(x.total for x in CART_ITEMS) - sum(x.total for x in items),
                order_amount=sum(x.total for x in items),
                cart=Cart(
                    total=CartTotal(amount=sum(x.total for x in items)),
                    items=items,
                ),
            )
            return response['data']['operation']
