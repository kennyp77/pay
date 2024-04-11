from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from pay.bill_payments.bill_payments.interactions.kazna.entities import DocumentCode
from pay.bill_payments.bill_payments.storage.entities.base import Entity


@dataclass
class Document(Entity):
    document_id: UUID  # так же используется как id в Персонализации
    uid: int
    code: DocumentCode  # code из KaznaAPI. Документация тут: https://st.yandex-team.ru/YANDEXPAY-2565
    value: str  # FIXME: начать тащить из персонализации!
    title: Optional[str] = None
    created: Optional[datetime] = None
    updated: Optional[datetime] = None
