from typing import List
from uuid import UUID

from sendr_aiopg.query_builder import CRUDQueries
from sendr_utils import alist

from pay.sprint.sprint.storage.db.tables import sprint_goals as t_sprint_goals
from pay.sprint.sprint.storage.entities.sprint_goal import SprintGoal
from pay.sprint.sprint.storage.mappers.base import BaseMapperCRUD
from pay.sprint.sprint.storage.mappers.sprint_goal.data import SprintGoalDataDumper, SprintGoalDataMapper


class SprintGoalMapper(BaseMapperCRUD[SprintGoal]):
    model = SprintGoal

    _builder = CRUDQueries(
        base=t_sprint_goals,
        id_fields=('sprint_goal_id',),
        mapper_cls=SprintGoalDataMapper,
        dumper_cls=SprintGoalDataDumper,
    )

    async def find_by_sprint_ids(self, sprint_ids: List[UUID]) -> List[SprintGoal]:
        return await alist(self.find(filters={'sprint_id': lambda sprint_id: sprint_id.in_(sprint_ids)}))
