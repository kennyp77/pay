from uuid import UUID

from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.storage.entities.sprint_goal import SprintGoal


class DeleteSprintGoalAction(BaseDBAction):
    def __init__(self, sprint_goal_id: UUID):
        super().__init__()

    async def handle(self) -> None:
        # parents chain?
        try:
            await self.storage.sprint_goal.delete(self.sprint_goal_id)
        except SprintGoal.DoesNotExist:
            pass
