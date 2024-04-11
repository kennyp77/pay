OWNER(g:yandex-pay)

IF(NOT SANITIZER_TYPE)
    PY3_LIBRARY()

    PEERDIR(
        contrib/python/aioresponses
        contrib/python/freezegun/py3
        contrib/python/pytest-asyncio
        contrib/python/pytest-mock
        mail/python/sendr-qtools
        pay/bill_payments/bill_payments
        pay/bill_payments/postgre
    )

    PY_SRCS(
        common_conftest.py
        db.py
        entities.py
        interactions.py
        unit/storage/mappers/base.py
        utils.py
    )

    END()

    RECURSE_FOR_TESTS(
        functional
        unit
    )
ENDIF()
