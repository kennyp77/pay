from sendr_aiohttp.handler import request_schema, response_schema

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.common import SprintIDSchema
from pay.sprint.sprint.api.schemas.sprint_goal import CreateSprintGoalRequestSchema, CreateSprintGoalResponseSchema
from pay.sprint.sprint.core.actions.sprint_goal.create import CreateSprintGoalAction


class SprintGoalsHandler(BaseHandler):
    @request_schema(SprintIDSchema(), location='match_info')
    @request_schema(CreateSprintGoalRequestSchema(), location='json')
    @response_schema(CreateSprintGoalResponseSchema())
    async def post(self):
        data = await self.get_data()
        sprint_goal = await self.run_action(CreateSprintGoalAction, **data)
        return self.make_response({'data': {'sprint_goal': sprint_goal}})
