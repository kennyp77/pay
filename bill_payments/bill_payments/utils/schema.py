import json

from marshmallow.fields import Field, Nested
from marshmallow.validate import ValidationError


class ValueField(Field):
    # See https://stackoverflow.com/questions/61614546/python-marshmallow-field-can-be-two-different-types
    def _deserialize(self, value, attr, data, **kwargs):
        if isinstance(value, str) or isinstance(value, list):
            return value
        else:
            raise ValidationError('Field should be str or list')


class NestedJsonStringField(Nested):
    def _serialize(self, nested_obj, attr, obj):
        data = super()._serialize(nested_obj, attr, obj)
        return json.dumps(data)

    def _deserialize(self, value, attr, data):
        try:
            return super()._deserialize(json.loads(value), attr, data)
        except json.JSONDecodeError:
            raise ValidationError('Field is not valid json')
