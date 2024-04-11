from sendr_aiohttp.handler import request_schema, response_schema

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.sprint import (
    CreateSprintRequestSchema,
    CreateSprintResponseSchema,
    GetSprintsRequestSchema,
    GetSprintsResponseSchema,
)
from pay.sprint.sprint.core.actions.sprint.create import CreateSprintAction
from pay.sprint.sprint.core.actions.sprint.list import GetSprintsAction


class SprintsHandler(BaseHandler):
    @request_schema(GetSprintsRequestSchema(), location='query')
    @response_schema(GetSprintsResponseSchema())
    async def get(self):
        data = await self.get_data()
        sprints = await self.run_action(GetSprintsAction, **data)
        return self.make_response({'data': sprints})

    @request_schema(CreateSprintRequestSchema(), location='json')
    @response_schema(CreateSprintResponseSchema())
    async def post(self):
        data = await self.get_data()
        sprint = await self.run_action(CreateSprintAction, **data)
        return self.make_response({'data': {'sprint': sprint}})
