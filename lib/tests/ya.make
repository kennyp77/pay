OWNER(g:yandex-pay)

IF(NOT SANITIZER_TYPE)
    PY3TEST()

    SIZE(MEDIUM)

    PEERDIR(
        contrib/python/aioresponses
        contrib/python/pytest-asyncio
        contrib/python/python-jose
        contrib/python/pytest-mock
        mail/python/sendr-qtools
        pay/lib/interactions
        pay/lib/schemas
        pay/lib/tvm
        pay/lib/utils
    )

    PY_SRCS(
        conftest.py
        interactions.py
        helpers.py
    )

    TEST_SRCS(
        entities/__init__.py
        entities/test_payment_token.py
        entities/test_shipping.py
        interactions/psp/test_payture.py
        interactions/psp/test_rbs.py
        interactions/psp/test_uniteller.py
        interactions/test_antifraud.py
        interactions/test_merchant.py
        interactions/test_passport_addresses.py
        interactions/test_sender.py
        interactions/test_split.py
        interactions/test_yandex_delivery.py
        interactions/test_yandex_pay_admin.py
        interactions/test_yandex_pay.py
        schemas/test_base.py
        tvm/test_acl_matcher.py
        tvm/test_ticket_checker.py
        utils/test_currency.py
        utils/test_datetime.py
        utils/test_uaas.py
    )

    END()
ENDIF()
