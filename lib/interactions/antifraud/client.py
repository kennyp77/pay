from typing import Any, Dict, Optional

from sendr_interactions import AbstractInteractionClient
from sendr_interactions.base import LogFlag
from sendr_qstats import Counter
from sendr_utils import without_none

from pay.lib.interactions.antifraud.entities import CashbackAntifraudStatus, Challenge, ChallengeStatus

CASHBACK_LABEL = 'CASHBACK'
CHALLENGE_LABEL = 'CHALLENGE'


class AbstractAntifraudClient(AbstractInteractionClient[Dict[str, Any]]):
    """
    Документация: https://wiki.yandex-team.ru/antispam/antifrod/
    """

    SERVICE = 'antifraud'
    LOG_RESPONSE_BODY = LogFlag.ALWAYS
    METRIC_COUNTER: Optional[Counter] = None

    def _safe_inc_metric(self, antifraud_type: str, metric_type: str) -> None:
        if not self.METRIC_COUNTER:
            return
        self.METRIC_COUNTER.labels(antifraud_type, metric_type).inc()

    def _map_challenge_response_to_result(self, response_body: dict) -> Challenge:
        if response_body['status'] == 'error':
            self._safe_inc_metric(CHALLENGE_LABEL, 'ERROR')
            return Challenge(status=ChallengeStatus.ERROR)

        if response_body['action'] == 'DENY':
            self._safe_inc_metric(CHALLENGE_LABEL, 'DENY')
            return Challenge(status=ChallengeStatus.DENY)

        if len(response_body['tags']) > 0:
            self._safe_inc_metric(CHALLENGE_LABEL, 'REQUIRED')
            return Challenge(status=ChallengeStatus.REQUIRED, url=response_body['tags'][0]['url'])

        self._safe_inc_metric(CHALLENGE_LABEL, 'NOT_REQUIRED')
        return Challenge(status=ChallengeStatus.NOT_REQUIRED)

    def _map_cashback_response_to_result(self, response_body: dict) -> CashbackAntifraudStatus:
        if response_body['status'] == 'error':
            self._safe_inc_metric(CASHBACK_LABEL, 'ERROR')
            return CashbackAntifraudStatus.ERROR

        if response_body['action'] == 'DENY' or 'no_plus' in response_body['tags']:
            self._safe_inc_metric(CASHBACK_LABEL, 'DENY')
            return CashbackAntifraudStatus.DENY

        self._safe_inc_metric(CASHBACK_LABEL, 'OK')
        return CashbackAntifraudStatus.OK

    async def _internal_get_antifraud_response(
        self,
        interaction_method: str,
        external_id: str,
        amount: int,
        trust_card_id: str,
        timestamp: int,
        uid: int,
        user_agent: str,
        user_ip: str,
        login_id: str,
        currency_number: str,
        additional_body: dict,
        device_id: Optional[str] = None,
    ) -> dict:
        trust_card_id = trust_card_id.removeprefix('card-x')

        request_body = without_none(
            {
                'external_id': external_id,
                'amount': amount,
                'card_id': trust_card_id,
                't': timestamp,
                'service_id': 1042,
                'uid': uid,
                'user_agent': user_agent,
                'ip': user_ip,
                'channel': 'acquiring',
                'login_id': login_id,
                'currency': currency_number,
                'sub_channel': 'yandex_pay',
                'device_id': device_id,
            }
        )
        request_body.update(additional_body)
        with self.logger:
            self.logger.context_push(**request_body)
            self.logger.info('Sending antifraud request')

        return await self.post(
            interaction_method=interaction_method,
            url=self.endpoint_url('score'),
            response_log=True,
            json=request_body,
        )

    async def get_challenge(
        self,
        external_id: str,
        amount: int,
        trust_card_id: str,
        timestamp: int,
        uid: int,
        user_agent: str,
        user_ip: str,
        login_id: str,
        currency_number: str,
        return_path: str,
        device_id: Optional[str] = None,
    ) -> Challenge:
        """Запросить challenge в антифроде.

        Args:
            external_id (str): уникальный id операции
            amount (int): копейки
            trust_card_id (str): id карты траста. Можно передавать с или без префикса 'card-x'
            timestamp (int): UNIX-epoch время в миллисекундах
            uid (int): уникальный идентификатор пользователя Яндекса
            user_agent (str): заголовок User-Agent
            user_ip (str): заголовок X-Real-Ip
            login_id (str): уникальный идентификатор сессии блэкбокса
            currency_number (str): валюта в виде строкового числа (например, для 'RUB' соответствует '643')
            return_path (str): куда возвращать пользователя после прохождения challenge
            device_id (Optional[str] = None): индентификатор мобильного устройства

        Returns:
            Challenge: результат похода в антифрод

        """
        return self._map_challenge_response_to_result(
            await self._internal_get_antifraud_response(
                interaction_method='get_antifraud_challenge',
                external_id=external_id,
                amount=amount,
                trust_card_id=trust_card_id,
                timestamp=timestamp,
                uid=uid,
                user_agent=user_agent,
                user_ip=user_ip,
                login_id=login_id,
                currency_number=currency_number,
                additional_body={
                    'retpath': return_path,
                    'request': 'PAY',
                },
                device_id=device_id,
            )
        )

    async def get_cashback_status(
        self,
        external_id: str,
        amount: int,
        trust_card_id: str,
        timestamp: int,
        uid: int,
        user_agent: str,
        user_ip: str,
        login_id: str,
        currency_number: str,
        device_id: Optional[str] = None,
    ) -> CashbackAntifraudStatus:
        """Проверить возможность начисления кэшбека.

        Args:
            external_id (str): уникальный id операции
            amount (int): копейки
            trust_card_id (str): id карты траста. Можно передавать с или без префикса 'card-x'
            timestamp (int): UNIX-epoch время в миллисекундах
            uid (int): уникальный идентификатор пользователя Яндекса
            user_agent (str): заголовок User-Agent
            user_ip (str): заголовок X-Real-Ip
            login_id (str): уникальный идентификатор сессии блэкбокса
            currency_number (str): валюта в виде строкового числа (например, для 'RUB' соответствует '643')
            device_id (Optional[str] = None): индентификатор мобильного устройства

        Returns:
            CashbackAntifraudStatus: результат похода в антифрод

        """
        return self._map_cashback_response_to_result(
            await self._internal_get_antifraud_response(
                interaction_method='get_cashback_antifraud',
                external_id=external_id,
                amount=amount,
                trust_card_id=trust_card_id,
                timestamp=timestamp,
                uid=uid,
                user_agent=user_agent,
                user_ip=user_ip,
                login_id=login_id,
                currency_number=currency_number,
                additional_body={
                    'request': 'cashback-plus',
                },
                device_id=device_id,
            )
        )
