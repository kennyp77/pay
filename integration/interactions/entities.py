from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class Env:
    base_url: str
    tvm_id: Optional[int] = None


@dataclass
class WebUser:
    uid: int
    cookies: Dict[str, str]
