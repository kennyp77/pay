create type bill_payments.order_status as enum ('new', 'paid', 'obsolete');
create type bill_payments.transaction_status as enum ('new', 'paid', 'cancelled', 'refunded');
create type bill_payments.payment_method_type as enum ('yandex_pay');

create table bill_payments.orders
(
    order_id UUID                       PRIMARY KEY,
    uid      BIGINT                     NOT NULL references bill_payments.users (uid) on delete cascade,
    status   bill_payments.order_status NOT NULL,
    created  TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
    updated  TIMESTAMPTZ                NOT NULL DEFAULT NOW()
);

create index orders_uid_idx ON bill_payments.orders (uid);

create table bill_payments.transactions
(
    transaction_id       UUID                              PRIMARY KEY,
    order_id             UUID                              NOT NULL references bill_payments.orders (order_id) on delete cascade,
    status               bill_payments.transaction_status  NOT NULL,
    amount               BIGINT                            NOT NULL,
    external_payment_id  TEXT                              NOT NULL,
    payer_data           JSONB                             NOT NULL DEFAULT '{}'::jsonb,
    payment_method       bill_payments.payment_method_type NOT NULL,
    cancel_reason        TEXT,
    created              TIMESTAMPTZ                       NOT NULL DEFAULT NOW(),
    updated              TIMESTAMPTZ                       NOT NULL DEFAULT NOW()
);

create unique index transactions_order_id_noncancelled_uniq on bill_payments.transactions (order_id) where status != 'cancelled';

create table bill_payments.bill_orders (
    bill_id  UUID        references bill_payments.bills (bill_id) on delete cascade,
    order_id UUID        references bill_payments.orders (order_id) on delete cascade,
    created  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (bill_id, order_id)
);
