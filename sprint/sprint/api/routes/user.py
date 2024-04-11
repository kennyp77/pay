from sendr_aiohttp import Url

from pay.sprint.sprint.api.handlers.user import UserUIDHandler

USER_ROUTES = (Url(r'/user', UserUIDHandler, name='user_uid'),)
