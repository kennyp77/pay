from typing import ClassVar, Dict, Iterable, Tuple, Union

AclSourceType = Union[int, Tuple[int, str], Tuple[int, Iterable[str]]]


class TvmAclMatcher:
    DEFAULT_ACL: ClassVar[str] = 'common'

    def __init__(self, route_acls: Dict[str, Iterable[str]], source: AclSourceType):
        if isinstance(source, int):
            tvm_id = source
            acls = {self.DEFAULT_ACL}
        else:
            tvm_id, raw_acls = source
            acls = {raw_acls} if isinstance(raw_acls, str) else set(raw_acls)

        self.tvm_id = tvm_id
        self.acls = acls
        self.route_acls = route_acls

    def match(self, tvm_id: int, route_name: str) -> bool:
        if tvm_id != self.tvm_id:
            return False

        route_acls = set(self.route_acls.get(route_name, ['common']))
        return bool(self.acls & route_acls)
