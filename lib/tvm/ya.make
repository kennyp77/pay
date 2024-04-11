OWNER(g:yandex-pay)

PY3_LIBRARY()

PEERDIR(
    mail/python/sendr-qtools
)

PY_SRCS(
    __init__.py
    acl_matcher.py
    exceptions.py
    ticket_checker.py
)

END()
