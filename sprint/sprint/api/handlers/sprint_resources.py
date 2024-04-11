from sendr_aiohttp.handler import request_schema, response_schema

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.sprint_resource import UpsertSprintResourceRequestSchema, UpsertSprintResourceResponseSchema
from pay.sprint.sprint.core.actions.sprint_resource.upsert import UpsertSprintResourceAction


class SprintResourcesHandler(BaseHandler):
    @request_schema(UpsertSprintResourceRequestSchema(), location='json')
    @response_schema(UpsertSprintResourceResponseSchema())
    async def put(self):
        data = await self.get_data()
        story = await self.run_action(UpsertSprintResourceAction, **data)
        return self.make_response({'data': {'sprint_resource': story}})
