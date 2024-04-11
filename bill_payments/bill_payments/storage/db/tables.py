from functools import partial

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

from sendr_aiopg.storage.types import UUID
from sendr_utils import enum_values

from pay.bill_payments.bill_payments.interactions.kazna.entities import DepartmentType, DocumentCode
from pay.bill_payments.bill_payments.storage.entities.enums import (
    BillStatus,
    OrderStatus,
    PaymentMethodType,
    TransactionStatus,
)

metadata = sa.MetaData(schema='bill_payments')

SAEnum = partial(sa.Enum, metadata=metadata, values_callable=enum_values)
SAEnumByName = partial(sa.Enum, metadata=metadata)

users = sa.Table(
    'users',
    metadata,
    sa.Column('uid', sa.BigInteger(), primary_key=True, nullable=False),
    sa.Column('revision', sa.BigInteger(), nullable=False, default=1),
    sa.Column('synced_revision', sa.BigInteger(), nullable=False, default=0),
    sa.Column('syncing_revision', sa.BigInteger(), nullable=True),
    sa.Column('subscription_id', sa.TEXT(), nullable=True),
    sa.Column('created', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated', sa.DateTime(timezone=True), nullable=False),
)

documents = sa.Table(
    'documents',
    metadata,
    sa.Column('document_id', UUID(), primary_key=True, nullable=False),
    sa.Column('uid', sa.BigInteger(), nullable=False),
    sa.Column('code', SAEnum(DocumentCode), nullable=False),
    sa.Column('value', sa.Text(), nullable=False),
    sa.Column('title', sa.Text(), nullable=True),
    sa.Column('created', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated', sa.DateTime(timezone=True), nullable=False),
)

bills = sa.Table(
    'bills',
    metadata,
    sa.Column('bill_id', UUID, primary_key=True, nullable=False),
    sa.Column('uid', sa.BigInteger(), nullable=False),
    sa.Column('supplier_bill_id', sa.TEXT(), nullable=False),
    sa.Column('document_id', UUID(), nullable=False),
    sa.Column('status', SAEnum(BillStatus, name='bill_status'), nullable=False),
    sa.Column('amount', sa.BigInteger(), nullable=False),
    sa.Column('amount_to_pay', sa.BigInteger(), nullable=False),
    sa.Column('bill_date', sa.DateTime(timezone=True), nullable=False),
    sa.Column('purpose', sa.TEXT(), nullable=True),
    sa.Column('kbk', sa.TEXT(), nullable=True),
    sa.Column('oktmo', sa.TEXT(), nullable=True),
    sa.Column('inn', sa.TEXT(), nullable=True),
    sa.Column('kpp', sa.TEXT(), nullable=True),
    sa.Column('bik', sa.TEXT(), nullable=True),
    sa.Column('account_number', sa.TEXT(), nullable=True),
    sa.Column('payee_name', sa.TEXT(), nullable=True),
    sa.Column('payer_name', sa.TEXT(), nullable=True),
    sa.Column('div_id', sa.BigInteger(), nullable=True),
    sa.Column('treasure_branch', sa.TEXT(), nullable=True),
    sa.Column('dep_type', SAEnumByName(DepartmentType), nullable=True),
    sa.Column('discount_size', sa.TEXT(), nullable=True),
    sa.Column('discount_date', sa.Date(), nullable=True),
    sa.Column('legal_act', sa.TEXT(), nullable=True),
    sa.Column('offense_name', sa.TEXT(), nullable=True),
    sa.Column('offense_place', sa.TEXT(), nullable=True),
    sa.Column('offense_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('paid_amount', sa.BigInteger(), nullable=True),
    sa.Column('paid_date', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated', sa.DateTime(timezone=True), nullable=False),
)

bill_orders = sa.Table(
    'bill_orders',
    metadata,
    sa.Column('bill_id', UUID(), primary_key=True, nullable=False),
    sa.Column('order_id', UUID(), primary_key=True, nullable=False),
    sa.Column('created', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated', sa.DateTime(timezone=True), nullable=False),
)

orders = sa.Table(
    'orders',
    metadata,
    sa.Column('order_id', UUID(), primary_key=True, nullable=False),
    sa.Column('uid', sa.BigInteger(), nullable=False),
    sa.Column('status', SAEnum(OrderStatus), nullable=False),
    sa.Column('created', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated', sa.DateTime(timezone=True), nullable=False),
)

transactions = sa.Table(
    'transactions',
    metadata,
    sa.Column('transaction_id', UUID(), primary_key=True, nullable=False),
    sa.Column('order_id', UUID(), nullable=False),
    sa.Column('status', SAEnum(TransactionStatus), nullable=False),
    sa.Column('amount', sa.BigInteger(), nullable=False),
    sa.Column('external_payment_id', sa.Text(), nullable=False),
    sa.Column('payer_data', JSONB(), nullable=False),
    sa.Column('payment_method', SAEnum(PaymentMethodType), nullable=False),
    sa.Column('cancel_reason', sa.Text(), nullable=False),
    sa.Column('created', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated', sa.DateTime(timezone=True), nullable=False),
)
