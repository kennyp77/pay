from sendr_aiohttp.handler import request_schema, response_schema

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.project import CreateProjectRequestSchema, CreateProjectResponseSchema
from pay.sprint.sprint.core.actions.project.create import CreateProjectAction


class ProjectsHandler(BaseHandler):
    @request_schema(CreateProjectRequestSchema(), location='json')
    @response_schema(CreateProjectResponseSchema())
    async def post(self):
        data = await self.get_data()
        project = await self.run_action(CreateProjectAction, **data)
        return self.make_response({'data': {'project': project}})
