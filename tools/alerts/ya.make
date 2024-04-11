OWNER(g:yandex-pay)

PY3_PROGRAM()

PEERDIR(
    contrib/python/requests
)

PY_SRCS(
    TOP_LEVEL
    MAIN alerts.py
    definitions/__init__.py
    definitions/api.py
    definitions/balancer.py
    definitions/deploy.py
    definitions/fim.py
    definitions/plus.py
    definitions/postgres.py
    definitions/promo.py
    definitions/workers.py
    common.py
)

END()
