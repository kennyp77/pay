from uuid import UUID

from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.core.entities.sprint_goal import CreateSprintGoalRequest
from pay.sprint.sprint.storage.entities.sprint_goal import SprintGoal


class CreateSprintGoalAction(BaseDBAction):
    def __init__(self, sprint_id: UUID, createsprintgoalrequest: CreateSprintGoalRequest):
        super().__init__()
        self.sprint_id = sprint_id
        self.request = createsprintgoalrequest

    async def handle(self) -> SprintGoal:
        # dedupe by title or idempotency key
        # generation
        return await self.storage.sprint_goal.create(
            SprintGoal(
                title=self.request.title,
                sprint_id=self.sprint_id,
                parent_goal_id=self.request.parent_goal_id,
            )
        )
