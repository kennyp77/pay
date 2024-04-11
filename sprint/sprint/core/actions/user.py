from pay.sprint.sprint.core.actions.base import BaseAsyncDBAction, BaseDBAction
from pay.sprint.sprint.core.exceptions import UserNotFoundError
from pay.sprint.sprint.storage.entities.user import User
from pay.sprint.sprint.storage.exceptions import UserNotFound


class GetUserAction(BaseDBAction):
    def __init__(self, uid: int):
        super().__init__()
        self.uid: int = uid

    async def handle(self) -> User:
        try:
            return await self.storage.user.get(self.uid)
        except UserNotFound:
            raise UserNotFoundError


class GetUserAsyncAction(BaseAsyncDBAction):
    """
    Пример async экшена, запускаемого через ActionWorker.
    Можно было бы сделать экшен GetUserAction асинхронным, но
    для иллюстрации привожу эти два экшена как отдельные.
    """

    max_retries = 5
    action_name = 'get_user_async'

    def __init__(self, uid: int):
        super().__init__()
        self.uid: int = uid

    async def handle(self) -> User:
        return await GetUserAction(self.uid).run()
