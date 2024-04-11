from sendr_aiohttp.handler import request_schema, response_schema

from pay.bill_payments.bill_payments.api.handlers.base import BaseHandler
from pay.bill_payments.bill_payments.api.schemas.user import user_schema, user_uid_schema


class UserUIDHandler(BaseHandler):
    @request_schema(user_uid_schema, location='query')
    @response_schema(user_schema)
    async def get(self):
        return self.make_response(
            {
                'uid': 1,
                'login_id': 'example_login',
            }
        )
