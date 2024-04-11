from dataclasses import asdict, replace
from uuid import UUID

from sendr_utils import without_missing

from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.core.entities.sprint_goal import UpdateSprintGoalRequest
from pay.sprint.sprint.storage.entities.sprint_goal import SprintGoal


class UpdateSprintGoalAction(BaseDBAction):
    def __init__(self, sprint_goal_id: UUID, updatesprintgoalrequest: UpdateSprintGoalRequest):
        super().__init__()
        self.sprint_goal_id = sprint_goal_id
        self.request = updatesprintgoalrequest

    async def handle(self) -> SprintGoal:
        sprint_goal = await self.storage.sprint_goal.get(self.sprint_goal_id)
        sprint_goal = replace(sprint_goal, **without_missing(asdict(self.request)))
        return await self.storage.sprint_goal.save(sprint_goal)
