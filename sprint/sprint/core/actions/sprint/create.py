from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.core.entities.sprint import CreateSprintRequest
from pay.sprint.sprint.storage.entities.sprint import Sprint


class CreateSprintAction(BaseDBAction):
    def __init__(self, createsprintrequest: CreateSprintRequest):
        super().__init__()
        self.request = createsprintrequest

    async def handle(self) -> Sprint:
        # copy resources from previous
        # check non-intersection
        return await self.storage.sprint.create(
            Sprint(starts_at=self.request.starts_at, ends_at=self.request.ends_at, title=self.request.title)
        )
