from uuid import uuid4

from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.core.entities.sprint_resource import UpsertSprintResourceRequest
from pay.sprint.sprint.storage.entities.sprint_resource import SprintResource


class UpsertSprintResourceAction(BaseDBAction):
    def __init__(self, upsertsprintresourcerequest: UpsertSprintResourceRequest):
        super().__init__()
        self.request = upsertsprintresourcerequest

    async def handle(self) -> SprintResource:
        return await self.storage.sprint_resource.create_or_update_by_sprint_and_resource_type(
            SprintResource(
                sprint_resource_id=uuid4(),
                resource_type_id=self.request.resource_type_id,
                sprint_id=self.request.sprint_id,
                amount=self.request.amount,
            )
        )
