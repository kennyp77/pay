from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class User:
    uid: int
    auth_cookies: Optional[Dict[str, str]] = None
