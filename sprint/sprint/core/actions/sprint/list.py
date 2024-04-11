from datetime import datetime
from typing import Dict, List
from uuid import UUID

from pay.sprint.sprint.core.actions.base import BaseDBAction
from pay.sprint.sprint.core.entities.sprint import GetSprintsRequest, GetSprintsResponse
from pay.sprint.sprint.storage.entities.project import Project
from pay.sprint.sprint.storage.entities.sprint import Sprint
from pay.sprint.sprint.storage.entities.sprint_story_resource import SprintStoryResource
from pay.sprint.sprint.storage.entities.story import Story


class GetSprintsAction(BaseDBAction):
    def __init__(self, getsprintsrequest: GetSprintsRequest):
        super().__init__()
        self.from_ = getsprintsrequest.from_
        self.to = getsprintsrequest.to

    async def handle(self) -> List[Sprint]:
        sprints_list = await self._get_sprints()
        if not sprints_list:
            return []
        sprints = {sprint.sprint_id: sprint for sprint in sprints_list}
        sprint_ids = [sprint.sprint_id for sprint in sprints_list]
        max_sprint_time = max(sprint.ends_at for sprint in sprints_list)

        sprint_story_resources = await self._get_story_resources_for_sprints(sprint_ids=sprint_ids)

        projects = await self._find_projects_for_sprints(
            sprints=sprints,
            sprint_ids=sprint_ids,
            sprint_story_resources=sprint_story_resources,
            max_sprint_time=max_sprint_time,
        )

        resource_types = await self.storage.resource_type.find_not_deleted()

        await self._join_goals_to_sprints(sprints, sprint_ids)
        await self._join_resources_to_sprints(sprints, sprint_ids)

        return GetSprintsResponse(
            sprints=sprints.values(),
            projects=projects.values(),
            sprint_story_resources=sprint_story_resources,
            resource_types=resource_types,
        )

    async def _get_sprints(self) -> List[Sprint]:
        return await self.storage.sprint.find_for_period(from_=self.from_, to=self.to)

    async def _get_story_resources_for_sprints(self, sprint_ids: List[UUID]) -> List[SprintStoryResource]:
        return await self.storage.sprint_story_resource.find_for_sprints(sprint_ids)

    async def _find_projects_for_sprints(
        self,
        sprints: Dict[UUID, Sprint],
        sprint_ids: List[UUID],
        sprint_story_resources: List[SprintStoryResource],
        max_sprint_time: datetime,
    ) -> Project:
        projects_list = await self.storage.project.find_not_done(created_at_lt=max_sprint_time)
        stories_list = await self.storage.story.find_not_done(
            created_at_lt=max_sprint_time, project_ids=[project.project_id for project in projects_list]
        )

        projects = {project.project_id: project for project in projects_list}
        stories = {story.story_id: story for story in stories_list}

        missing_done_story_ids = set()
        for resource in sprint_story_resources:
            if resource.story_id not in stories:
                missing_done_story_ids.add(resource.story_id)

        missing_done_stories = await self._find_missing_stories(
            already_found_stories=stories, sprint_story_resources=sprint_story_resources
        )
        missing_done_project_ids = set()
        for story in missing_done_stories:
            stories[story.story_id] = story
            if story.project_id not in projects:
                missing_done_project_ids.add(story.project_id)

        missing_done_projects = await self.storage.project.find_by_ids(list(missing_done_project_ids))
        for project in missing_done_projects:
            projects[project.project_id] = project

        for project in projects.values():
            project.stories = []
        for story in stories.values():
            projects[story.project_id].stories.append(story)

        story_sprint_ids = {story_id: set() for story_id in stories}
        for story in stories.values():
            if story.done:
                continue
            for sprint in sprints.values():
                if sprint.ends_at > story.created:
                    story_sprint_ids[story.story_id].add(sprint.sprint_id)
        for resource in sprint_story_resources:
            story_sprint_ids[resource.story_id].add(resource.sprint_id)
        for story in stories.values():
            story.sprint_ids = list(story_sprint_ids[story.story_id])
        return projects

    async def _find_missing_stories(
        self, already_found_stories: Dict[UUID, Story], sprint_story_resources: List[SprintStoryResource]
    ) -> List[Story]:
        missing_done_story_ids = set()
        for resource in sprint_story_resources:
            if resource.story_id not in already_found_stories:
                missing_done_story_ids.add(resource.story_id)

        return await self.storage.story.find_by_ids(list(missing_done_story_ids))

    async def _join_goals_to_sprints(self, sprints: Dict[UUID, Sprint], sprint_ids: List[UUID]) -> None:
        goals = await self.storage.sprint_goal.find_by_sprint_ids(sprint_ids=sprint_ids)
        for sprint in sprints.values():
            sprint.goals = []
        for goal in goals:
            sprints[goal.sprint_id].goals.append(goal)

    async def _join_resources_to_sprints(self, sprints: Dict[UUID, Sprint], sprint_ids: List[UUID]) -> None:
        resources = await self.storage.sprint_resource.find_by_sprint_ids(sprint_ids=sprint_ids)
        for sprint in sprints.values():
            sprint.resources = []
        for resource in resources:
            sprints[resource.sprint_id].resources.append(resource)
