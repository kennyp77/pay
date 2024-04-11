import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from sendr_interactions import AbstractInteractionClient
from sendr_utils import utcnow

from pay.lib.entities.enums import YandexPayAdminInternalEventType


class AbstractYandexPayAdminClient(AbstractInteractionClient[Dict[str, Any]]):
    SERVICE = 'yandex-pay-admin'

    async def trigger_first_transaction(
        self, merchant_id: UUID, partner_id: UUID, event_time: Optional[datetime.datetime] = None
    ) -> None:
        url = self.endpoint_url('internal/v1/events')
        event_time = event_time or utcnow()
        params = {
            'event_time': event_time.isoformat(),
            'data': {
                'event_type': YandexPayAdminInternalEventType.FIRST_TRANSACTION.value,
                'merchant_id': str(merchant_id),
                'partner_id': str(partner_id),
            },
        }
        await self.post(
            interaction_method='trigger_first_transaction',
            url=url,
            json=params,
        )
