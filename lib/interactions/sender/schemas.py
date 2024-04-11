from marshmallow import fields
from marshmallow_enum import EnumField

from sendr_utils.schemas.dataclass import BaseDataClassSchema

import pay.lib.interactions.sender.entities as entities
from pay.lib.interactions.sender.enums import SenderResultStatus


class CIEnumField(EnumField):
    def _deserialize_by_value(self, value, attr, data):
        for each in self.enum:
            if each.value.casefold() == value.casefold():
                return each

        self.fail('by_value', input=value, value=value)


class SenderResultSchema(BaseDataClassSchema[entities.SenderResult]):
    status = CIEnumField(SenderResultStatus, by_value=True, required=True)


class SenderTransactionalEmailResultSchema(BaseDataClassSchema[entities.SenderTransactionalEmailResult]):
    status = CIEnumField(SenderResultStatus, by_value=True, required=True)
    message_id = fields.String(required=True)
    task_id = fields.String(required=True)


class SenderTransactionalEmailStatusSchema(BaseDataClassSchema[entities.SenderTransactionalEmailStatus]):
    code = fields.Integer(required=True)
    retry = fields.Boolean(required=False, missing=None, allow_none=True)
    message = fields.String(load_from='msg', required=False, missing=None, allow_none=True)


class SenderMaillistSubscriptionCancelResultSchema(
    BaseDataClassSchema[entities.SenderMaillistSubscriptionCancelResult]
):
    status = CIEnumField(SenderResultStatus, by_value=True, required=True)
    disabled = fields.Boolean(required=True)
    already_disabled = fields.Boolean(required=True)


sender_result_schema = SenderResultSchema()
sender_transactional_email_result_schema = SenderTransactionalEmailResultSchema()
sender_transactional_email_status_schema = SenderTransactionalEmailStatusSchema()
sender_maillist_subscription_cancel_result_schema = SenderMaillistSubscriptionCancelResultSchema()
