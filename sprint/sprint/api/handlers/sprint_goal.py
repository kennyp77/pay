from sendr_aiohttp.handler import request_schema, response_schema

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.common import SprintGoalIDSchema
from pay.sprint.sprint.api.schemas.sprint_goal import UpdateSprintGoalRequestSchema, UpdateSprintGoalResponseSchema
from pay.sprint.sprint.core.actions.sprint_goal.update import UpdateSprintGoalAction


class SprintGoalHandler(BaseHandler):
    @request_schema(SprintGoalIDSchema(), location='match_info')
    @request_schema(UpdateSprintGoalRequestSchema(), location='json')
    @response_schema(UpdateSprintGoalResponseSchema())
    async def patch(self):
        data = await self.get_data()
        sprint_goal = await self.run_action(UpdateSprintGoalAction, **data)
        return self.make_response({'data': {'sprint_goal': sprint_goal}})
