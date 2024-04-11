from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.core.entities.story import CreateStoryRequest
from pay.sprint.sprint.storage.entities.story import Story


class CreateStoryAction(BaseDBAction):
    def __init__(self, createstoryrequest: CreateStoryRequest):
        super().__init__()
        self.request = createstoryrequest

    async def handle(self) -> Story:
        # dedupe by title
        return await self.storage.story.create(
            Story(
                project_id=self.request.project_id,
                title=self.request.title,
                responsible_uid=self.request.responsible_uid,
                startrek_issue_key=self.request.startrek_issue_key,
            )
        )
