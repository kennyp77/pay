from pay.sprint.sprint.core.actions.base import BaseDBAction


class PingDBAction(BaseDBAction):
    async def handle(self):
        await self.storage.conn.execute('select 1;')
