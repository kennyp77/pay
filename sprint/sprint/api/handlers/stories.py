from sendr_aiohttp.handler import request_schema, response_schema

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.story import CreateStoryRequestSchema, CreateStoryResponseSchema
from pay.sprint.sprint.core.actions.story.create import CreateStoryAction


class StoriesHandler(BaseHandler):
    @request_schema(CreateStoryRequestSchema(), location='json')
    @response_schema(CreateStoryResponseSchema())
    async def post(self):
        data = await self.get_data()
        story = await self.run_action(CreateStoryAction, **data)
        return self.make_response({'data': {'story': story}})
