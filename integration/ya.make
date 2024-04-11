OWNER(g:yandex-pay)

PY3_LIBRARY()

PEERDIR(
    billing/yandex_pay_plus/yandex_pay_plus
    contrib/python/aiohttp
    contrib/python/pytest-asyncio
    contrib/python/pytest-mock
    library/python/pytest/allure
    pay/contrib/marshmallow_dataclass
    pay/lib/entities
    pay/lib/schemas
    mail/python/sendr-qtools
)

PY_SRCS(
    catalog.py
    conf.py
    interactions/__init__.py
    interactions/base.py
    interactions/clients/passport_web.py
    interactions/clients/tus.py
    interactions/clients/yandex_pay/__init__.py
    interactions/clients/yandex_pay/checkout.py
    interactions/clients/yandex_pay/merchant.py
    interactions/clients/yandex_pay/schemas.py
    interactions/entities.py
    steps/checkout/order.py
    steps/threeds/rbs.py
    utils/__init__.py
    utils/log.py
)

RESOURCE_FILES(
    PREFIX pay/integration/
    settings/000-common.conf
)

END()

RECURSE_FOR_TESTS(tests)
