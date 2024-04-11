from dataclasses import dataclass, fields


@dataclass
class MITInfo:
    recurring: bool = False
    deferred: bool = False

    def is_empty(self) -> bool:
        return all(not getattr(self, field.name) for field in fields(self))
