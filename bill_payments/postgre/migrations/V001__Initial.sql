CREATE SCHEMA bill_payments;

CREATE TABLE bill_payments.users
(
    uid              BIGINT      NOT NULL PRIMARY KEY,
    revision         BIGINT      NOT NULL DEFAULT 1,
    synced_revision  BIGINT      NOT NULL DEFAULT 0,
    syncing_revision BIGINT      NULL,
    subscription_id  TEXT        NULL,
    created          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_subscription_id_unique_idx ON bill_payments.users (subscription_id) WHERE subscription_id IS NOT NULL;

CREATE TABLE bill_payments.documents
(
    document_id UUID        NOT NULL PRIMARY KEY,
    uid         BIGINT      NOT NULL,
    code        TEXT        NOT NULL,
    value       TEXT        NOT NULL,
    title       TEXT,
    created     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_documents_on_users FOREIGN KEY (uid) REFERENCES bill_payments.users (uid)
);

CREATE INDEX documents_uid_idx ON bill_payments.documents (uid);

CREATE TYPE bill_payments.bill_status as enum ('new', 'paid', 'gone');
CREATE TYPE bill_payments.department_type as enum (
    'GIBDD', 'FNS', 'FSSP', 'ROSREESTR', 'ROSREESTR_OFFER', 'GUVMMVD', 'ROSGVARD', 'PARK', 'PARK_FINES', 'JKH', 'RNIP', 'DONATION', 'JUSTICE', 'UNKNOWN'
);

CREATE TABLE bill_payments.bills
(
    bill_id          UUID                             PRIMARY KEY,
    uid              BIGINT                           NOT NULL,
    supplier_bill_id TEXT                             NOT NULL,
    document_id      UUID                             NOT NULL,
    status           bill_payments.bill_status        NOT NULL,
    amount           BIGINT                           NOT NULL,
    amount_to_pay    BIGINT                           NOT NULL,
    purpose          TEXT                             NULL,
    kbk              TEXT                             NULL,
    oktmo            TEXT                             NULL,
    inn              TEXT                             NULL,
    kpp              TEXT                             NULL,
    bik              TEXT                             NULL,
    account_number   TEXT                             NULL,
    payer_name       TEXT                             NULL,
    payee_name       TEXT                             NULL,
    div_id           BIGINT                           NULL,
    treasure_branch  TEXT                             NULL,
    dep_type         bill_payments.department_type    NULL,
    bill_date        TIMESTAMPTZ                      NOT NULL,
    discount_size    TEXT                             NULL,
    discount_date    DATE                             NULL,
    legal_act        TEXT                             NULL,
    offense_name     TEXT                             NULL,
    offense_place    TEXT                             NULL,
    offense_date     TIMESTAMPTZ                      NULL,
    paid_amount      BIGINT                           NULL,
    paid_date        TIMESTAMPTZ                      NULL,
    created          TIMESTAMPTZ                      NOT NULL DEFAULT NOW(),
    updated          TIMESTAMPTZ                      NOT NULL DEFAULT NOW(),
    UNIQUE (uid, supplier_bill_id),
    CONSTRAINT fk_bills_on_users FOREIGN KEY (uid) REFERENCES bill_payments.users (uid),
    CONSTRAINT fk_bills_on_documents FOREIGN KEY (document_id) REFERENCES bill_payments.documents (document_id)
        ON DELETE CASCADE
);

create type bill_payments.task_type as enum ('run_action');
create type bill_payments.task_state as enum ('failed', 'pending', 'processing', 'finished', 'deleted', 'cleanup');
create type bill_payments.worker_type as enum ('run_action');
create type bill_payments.worker_state as enum ('running', 'shutdown', 'failed', 'cleanedup');


create table bill_payments.tasks
(
    task_id     bigserial primary key,
    task_type   bill_payments.task_type  not null,
    state       bill_payments.task_state not null,
    params      jsonb,
    details     jsonb,
    retries     integer                  not null default 0,
    run_at      timestamptz              not null default now(),
    created     timestamptz              not null default now(),
    updated     timestamptz              not null default now(),
    action_name text
);

create table bill_payments.workers
(
    worker_id   text primary key,
    worker_type bill_payments.worker_type  not null,
    host        text                       not null,
    state       bill_payments.worker_state not null,
    heartbeat   timestamptz,
    startup     timestamptz,
    task_id     bigint references bill_payments.tasks
);

create index tasks_state_run_at_idx on bill_payments.tasks (state, run_at);
