from sendr_aiohttp.handler import request_schema, response_schema

from pay.sprint.sprint.api.handlers.base import BaseHandler
from pay.sprint.sprint.api.schemas.user import user_schema, user_uid_schema
from pay.sprint.sprint.core.actions.user import GetUserAction


class UserUIDHandler(BaseHandler):
    @request_schema(user_uid_schema, location='query')
    @response_schema(user_schema)
    async def get(self):
        data = await self.get_data()
        user = await self.run_action(GetUserAction, **data)
        return self.make_response(user)
