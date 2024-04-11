import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import NUMERIC

from pay.sprint.sprint.storage.types import UUID

metadata = sa.MetaData(schema='sprint')


AMOUNT_NUMERIC = NUMERIC(precision=5, scale=2)


users = sa.Table(
    'users',
    metadata,
    sa.Column('uid', sa.BigInteger(), primary_key=True, nullable=False),
    sa.Column('login', sa.Text(), nullable=False),
)


projects = sa.Table(
    'projects',
    metadata,
    sa.Column('project_id', UUID(), primary_key=True, nullable=False),
    sa.Column('title', sa.Text(), nullable=False),
    sa.Column('responsible_uid', sa.BigInteger(), nullable=False),
    sa.Column('startrek_issue_key', sa.Text(), nullable=True),
    sa.Column('yandex_goal_id', sa.Text(), nullable=True),
    sa.Column('done', sa.Boolean(), nullable=False),
    sa.Column('created', sa.DateTime(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
)


stories = sa.Table(
    'stories',
    metadata,
    sa.Column('story_id', UUID(), primary_key=True, nullable=False),
    sa.Column('project_id', UUID(), nullable=False),
    sa.Column('title', sa.Text(), nullable=False),
    sa.Column('responsible_uid', sa.BigInteger(), nullable=False),
    sa.Column('startrek_issue_key', sa.Text(), nullable=True),
    sa.Column('done', sa.Boolean(), nullable=False),
    sa.Column('created', sa.DateTime(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
)


sprints = sa.Table(
    'sprints',
    metadata,
    sa.Column('sprint_id', UUID(), primary_key=True, nullable=False),
    sa.Column('starts_at', sa.DateTime(), nullable=False),
    sa.Column('ends_at', sa.DateTime(), nullable=False),
    sa.Column('title', sa.Text(), nullable=False),
    sa.Column('created', sa.DateTime(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
)


sprint_goals = sa.Table(
    'sprint_goals',
    metadata,
    sa.Column('sprint_goal_id', UUID(), primary_key=True, nullable=False),
    sa.Column('title', sa.Text(), nullable=False),
    sa.Column('sprint_id', UUID(), nullable=False),
    sa.Column('parent_goal_id', UUID(), nullable=True),
    sa.Column('generation', sa.Integer(), nullable=True),
    sa.Column('done', sa.Boolean(), nullable=False),
    sa.Column('deleted', sa.Boolean(), nullable=False),
    sa.Column('created', sa.DateTime(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
)


resource_types = sa.Table(
    'resource_types',
    metadata,
    sa.Column('resource_type_id', UUID(), primary_key=True, nullable=False),
    sa.Column('title', sa.Text(), nullable=False),
    sa.Column('code', sa.Text(), nullable=False),
    sa.Column('deleted', sa.Boolean(), nullable=False),
    sa.Column('created', sa.DateTime(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
)


sprint_resources = sa.Table(
    'sprint_resources',
    metadata,
    sa.Column('sprint_resource_id', UUID(), primary_key=True, nullable=False),
    sa.Column('resource_type_id', UUID(), nullable=False),
    sa.Column('sprint_id', UUID(), nullable=False),
    sa.Column('amount', AMOUNT_NUMERIC, nullable=False),
    sa.Column('created', sa.DateTime(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
)


sprint_story_resources = sa.Table(
    'sprint_story_resources',
    metadata,
    sa.Column('sprint_story_resource_id', UUID(), primary_key=True, nullable=False),
    sa.Column('resource_type_id', UUID(), nullable=False),
    sa.Column('sprint_id', UUID(), nullable=False),
    sa.Column('story_id', UUID(), nullable=False),
    sa.Column('amount', AMOUNT_NUMERIC, nullable=False),
    sa.Column('created', sa.DateTime(), nullable=False),
    sa.Column('updated', sa.DateTime(), nullable=False),
)
