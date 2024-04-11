create schema sprint;

---entities
create table sprint.projects (
    project_id uuid primary key,
    title text not null,
    responsible_uid bigint not null,
    startrek_issue_key text,
    yandex_goal_id text,
    done boolean not null default false,
    created timestamptz not null default now(),
    updated timestamptz not null default now()
);

create table sprint.stories (
    story_id uuid primary key,
    project_id uuid not null references sprint.projects (project_id),
    title text not null,
    responsible_uid bigint not null,
    startrek_issue_key text,
    done boolean not null default false,
    created timestamptz not null default now(),
    updated timestamptz not null default now()
);

create table sprint.sprints (
    sprint_id uuid primary key,
    starts_at timestamptz not null,
    ends_at timestamptz not null,
    working_hours int not null default 40,
    title text not null,
    created timestamptz not null default now(),
    updated timestamptz not null default now()
);

create table sprint.sprint_goals (
    sprint_goal_id uuid primary key,
    title text not null,
    sprint_id uuid not null references sprint.sprints (sprint_id),
    parent_goal_id uuid references sprint.sprint_goals (sprint_goal_id) on delete set null,
    generation int not null default 0,
    done boolean not null default false,
    deleted boolean not null default false,
    created timestamptz not null default now(),
    updated timestamptz not null default now()
);

create table sprint.resource_types (
    resource_type_id uuid primary key,
    title text not null,
    code text not null,
    color int, -- not null,
    deleted boolean not null default false,
    created timestamptz not null default now(),
    updated timestamptz not null default now()
);

create table sprint.sprint_resources (
    sprint_resource_id uuid primary key,
    resource_type_id uuid not null references sprint.resource_types (resource_type_id),
    sprint_id uuid not null references sprint.sprints (sprint_id),
    amount numeric(5, 2) not null,
    created timestamptz not null default now(),
    updated timestamptz not null default now()
);
create unique index sprint_resources_resource_type_id_sprint_id_uniq on sprint.sprint_resources (resource_type_id, sprint_id);

create table sprint.sprint_story_resources (
    sprint_story_resource_id uuid primary key,
    resource_type_id uuid not null references sprint.resource_types (resource_type_id),
    sprint_id uuid not null references sprint.sprints (sprint_id),
    story_id uuid not null references sprint.stories (story_id),
    amount numeric(5, 2) not null,
    created timestamptz not null default now(),
    updated timestamptz not null default now()
);

---taskq
create type sprint.task_type as enum ('run_action');
create type sprint.task_state as enum ('failed', 'pending', 'processing', 'finished', 'deleted', 'cleanup');
create type sprint.worker_type as enum ('run_action');
create type sprint.worker_state as enum ('running', 'shutdown', 'failed', 'cleanedup');


create table sprint.tasks (
    task_id     bigserial   primary key,
    task_type   sprint.task_type   not null,
    state       sprint.task_state  not null,
    params      jsonb,
    details     jsonb,
    retries     integer     not null default 0,
    run_at      timestamptz not null default now(),
    created     timestamptz not null default now(),
    updated     timestamptz not null default now(),
    action_name text
);

create table sprint.workers (
    worker_id   text        primary key,
    worker_type sprint.worker_type  not null,
    host        text                         not null,
    state       sprint.worker_state not null,
    heartbeat   timestamptz,
    startup     timestamptz,
    task_id     bigint references sprint.tasks
);
