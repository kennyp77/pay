OWNER(g:yandex-pay)

PY3_LIBRARY()

PEERDIR(
    contrib/python/marshmallow-enum/py2
    pay/lib/entities
    mail/python/sendr-qtools
)

PY_SRCS(
    __init__.py
    base.py
    card.py
    cart.py
    checkout.py
    threeds.py
)


END()
