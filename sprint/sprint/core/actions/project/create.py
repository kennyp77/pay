from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.core.entities.project import CreateProjectRequest
from pay.sprint.sprint.storage.entities.project import Project


class CreateProjectAction(BaseDBAction):
    def __init__(self, createprojectrequest: CreateProjectRequest):
        super().__init__()
        self.request = createprojectrequest

    async def handle(self) -> Project:
        # dedupe by title
        return await self.storage.project.create(
            Project(
                title=self.request.title,
                responsible_uid=self.request.responsible_uid,
                startrek_issue_key=self.request.startrek_issue_key,
                yandex_goal_id=self.request.yandex_goal_id,
            )
        )
