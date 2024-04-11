from dataclasses import dataclass
from typing import Optional


@dataclass
class Contact:
    id: Optional[str] = None
    first_name: Optional[str] = None
    second_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
