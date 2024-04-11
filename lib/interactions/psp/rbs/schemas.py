from typing import Any, Dict, List

import marshmallow_dataclass
from marshmallow import post_dump

from sendr_utils.schemas.camel_case import CamelCaseSchema as BaseCamelCaseSchema

from pay.lib.interactions.psp.rbs.entities import (
    Cart,
    Order,
    OrderBundle,
    PaymentResult3DSV1,
    PaymentResult3DSV2Challenge,
    PaymentResult3DSV2Fingerprinting,
    RegisterResult,
)


class CamelCaseSchema(BaseCamelCaseSchema):
    SKIP_NONE = True

    @classmethod
    def to_array(cls, data: Dict[str, Any], prefix: str) -> List[Dict[str, str]]:
        result = []
        for k, v in data.items():
            if isinstance(v, dict):
                result.extend(cls.to_array(v, f'{prefix}{k}.'))
            elif isinstance(v, list):
                result.append({'name': f'{prefix}{k}', 'value': ', '.join(map(str, v))})
            elif v is not None:
                result.append({'name': f'{prefix}{k}', 'value': str(v)})
        result.sort(key=lambda x: x['name'])
        return result

    @post_dump
    def convert_item_attributes(self, data: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        if 'itemAttributes' in data:
            data['itemAttributes'] = {'attributes': self.to_array(data['itemAttributes'], '')}
        return data


RegisterResultSchema = marshmallow_dataclass.class_schema(RegisterResult, base_schema=CamelCaseSchema)
PaymentResult3DSV1Schema = marshmallow_dataclass.class_schema(PaymentResult3DSV1, base_schema=CamelCaseSchema)
PaymentResult3DSV2FingerprintingSchema = marshmallow_dataclass.class_schema(
    PaymentResult3DSV2Fingerprinting, base_schema=CamelCaseSchema
)
PaymentResult3DSV2ChallengeSchema = marshmallow_dataclass.class_schema(
    PaymentResult3DSV2Challenge, base_schema=CamelCaseSchema
)
CartSchema = marshmallow_dataclass.class_schema(Cart, base_schema=CamelCaseSchema)
OrderBundleSchema = marshmallow_dataclass.class_schema(OrderBundle, base_schema=CamelCaseSchema)
OrderSchema = marshmallow_dataclass.class_schema(Order, base_schema=CamelCaseSchema)
