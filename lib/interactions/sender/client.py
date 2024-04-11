import json
from typing import Any, ClassVar, Dict, Optional
from urllib.parse import quote

from aiohttp import BasicAuth, ClientResponse, hdrs

from sendr_interactions import AbstractInteractionClient

from pay.lib.interactions.sender.entities import (
    SenderMaillistSubscriptionCancelResult,
    SenderResult,
    SenderTransactionalEmailResult,
    SenderTransactionalEmailStatus,
)
from pay.lib.interactions.sender.exceptions import SenderMessageNotFoundError, SenderResponseError
from pay.lib.interactions.sender.schemas import (
    sender_maillist_subscription_cancel_result_schema,
    sender_result_schema,
    sender_transactional_email_result_schema,
    sender_transactional_email_status_schema,
)


class AbstractSenderClient(AbstractInteractionClient):
    """Interaction client for Yandex Sender.
    API docs: https://wiki.yandex-team.ru/sender/API/
    """

    SERVICE = 'sender'

    account_slug: ClassVar[str]
    basic_auth_login: ClassVar[str]

    def _get_session_kwargs(self) -> Dict[str, Any]:
        kwargs = super()._get_session_kwargs()
        if self.TVM_ID is None:
            kwargs['auth'] = BasicAuth(login=self.basic_auth_login)
        return kwargs

    async def _get_response_error_data(self, response: ClientResponse) -> Dict[str, Any]:
        """Извлекаем вспомогательные поля из ответа с ошибкой для логирования.
        Какие-то из полей могут быть или не быть в зависимости от HTTP Status Code,
        и, возможно, ручки.
        """
        # shouldn't log the whole response as it might contain user emails
        error_fields = {'status', 'error', 'msg', 'message', 'message_id', 'code', 'retry'}

        data = await self._get_response_body(response)

        if 'response' not in data:
            # not a JSON response
            return data

        data = data['response']
        # flattening the response as the error details might be either in the dict
        # itself or under the 'result' key. See the error examples here:
        # https://github.yandex-team.ru/sendr/sendr/blob/master/docs/transaction-api.md
        data |= data.pop('result', {})

        error_data = {field: data[field] for field in error_fields & data.keys()}
        return error_data

    async def _handle_response_error(self, response: ClientResponse) -> None:
        await self._try_log_error_response_body(response)
        raise SenderResponseError(
            status_code=response.status,
            method=response.method,
            service=self.SERVICE,
            params=await self._get_response_error_data(response),
        )

    async def send_transactional_email(
        self,
        campaign_slug: str,
        to_email: Optional[str] = None,
        to_uid: Optional[int] = None,
        render_context: Optional[Dict[str, Any]] = None,
        reply_email: Optional[str] = None,
        has_user_generated_content: bool = False,
        for_testing: bool = False,
    ) -> SenderTransactionalEmailResult:
        if to_email is None and to_uid is None:
            raise ValueError('Either to_email or to_uid must be provided')

        campaign_slug = quote(campaign_slug, safe='')
        self.assert_string_urlsafe_for_path(campaign_slug)
        url = self.endpoint_url(f'{self.account_slug}/transactional/{campaign_slug}/send')

        render_context = render_context or {}
        data = {
            'async': True,
            'args': render_context,
            'has_ugc': has_user_generated_content,
            'for_testing': for_testing,
        }

        # if both are given, to_email will be used:
        # https://github.yandex-team.ru/sendr/sendr/blob/master/docs/transaction-api.md#отправка-на-uid
        if to_email is not None:
            data['to_email'] = to_email
        if to_uid is not None:
            data['to_yandex_puid'] = to_uid

        headers = dict()
        if reply_email:
            headers['Reply-To'] = reply_email
        if headers:
            data['headers'] = json.dumps(headers)

        response = await self.post(
            interaction_method='send_transactional_email',
            url=url,
            json=data,
        )

        return sender_transactional_email_result_schema.load_one(response['result'])

    async def check_transactional_email_status(
        self, campaign_slug: str, message_id: str
    ) -> SenderTransactionalEmailStatus:
        campaign_slug = quote(campaign_slug, safe='')
        self.assert_string_urlsafe_for_path(campaign_slug)

        url = self.endpoint_url(f'{self.account_slug}/transactional/{campaign_slug}/status')
        params = {'message_id': message_id}

        response = await self.get(
            interaction_method='check_transactional_email_status',
            url=url,
            params=params,
        )
        result = sender_transactional_email_status_schema.load_one(response)

        if result.code >= 400:
            if result.code == 404:
                error_cls = SenderMessageNotFoundError
            else:
                error_cls = SenderResponseError

            raise error_cls(
                status_code=result.code,
                method=hdrs.METH_GET.lower(),
                service=self.SERVICE,
                message=result.message,
                params={
                    'campaign_slug': campaign_slug,
                    'message_id': message_id,
                    'retry': result.retry,
                },
            )

        return result

    async def add_to_maillist(
        self,
        maillist_slug: str,
        email: str,
        subscriber_params: Optional[Dict[str, Any]] = None,
    ) -> SenderResult:
        maillist_slug = quote(maillist_slug, safe='')
        self.assert_string_urlsafe_for_path(maillist_slug)

        url = self.endpoint_url(f'{self.account_slug}/maillist/{maillist_slug}/subscription')
        data: Dict[str, Any] = {'email': email}
        if subscriber_params is not None:
            data['params'] = subscriber_params

        response = await self.put('add_to_maillist', url=url, json=data)
        return sender_result_schema.load_one(response['result'])

    async def remove_from_maillist(self, maillist_slug: str, email: str) -> SenderMaillistSubscriptionCancelResult:
        maillist_slug = quote(maillist_slug, safe='')
        self.assert_string_urlsafe_for_path(maillist_slug)

        url = self.endpoint_url(f'{self.account_slug}/maillist/{maillist_slug}/subscription')
        data = {'email': email}

        response = await self.delete('remove_from_maillist', url=url, json=data)
        return sender_maillist_subscription_cancel_result_schema.load_one(response['result'])

    async def add_to_unsubscribe_list(self, unsubscribe_list_slug: str, email: str) -> SenderResult:
        unsubscribe_list_slug = quote(unsubscribe_list_slug, safe='')
        self.assert_string_urlsafe_for_path(unsubscribe_list_slug)

        url = self.endpoint_url(f'{self.account_slug}/unsubscribe/list/{unsubscribe_list_slug}')
        params = {'email': email}

        response = await self.put('add_to_unsubscribe_list', url=url, params=params)
        return sender_result_schema.load_one(response['result'])

    async def remove_from_unsubscribe_list(self, unsubscribe_list_slug: str, email: str) -> SenderResult:
        unsubscribe_list_slug = quote(unsubscribe_list_slug, safe='')
        self.assert_string_urlsafe_for_path(unsubscribe_list_slug)

        url = self.endpoint_url(f'{self.account_slug}/unsubscribe/list/{unsubscribe_list_slug}')
        params = {'email': email}

        response = await self.delete('remove_from_unsubscribe_list', url=url, params=params)
        return sender_result_schema.load_one(response['result'])
