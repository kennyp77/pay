OWNER(g:yandex-pay)

PY3_LIBRARY()

PEERDIR(
    contrib/python/Babel
)

PY_SRCS(
    __init__.py
    currency.py
    datetime.py
    exceptions.py
    uaas.py
)

END()
