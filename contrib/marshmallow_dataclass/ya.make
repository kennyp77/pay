PY3_LIBRARY()

LICENSE(MIT)

OWNER(g:yandex-pay)

VERSION(7.4.0)

PEERDIR(
    contrib/python/marshmallow/py2
    contrib/python/marshmallow-enum/py2
    contrib/python/mypy
    contrib/python/typing-inspect
)

PY_SRCS(
    TOP_LEVEL
    marshmallow_dataclass/__init__.py
    marshmallow_dataclass/mypy.py
)

RESOURCE_FILES(
    PREFIX pay/contrib/marshmallow_dataclass/
    .dist-info/METADATA
    .dist-info/top_level.txt
)

END()

RECURSE_FOR_TESTS(
    tests
)
