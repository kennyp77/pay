OWNER(g:yandex-pay)

PY3TEST()
TAG(
    ya:external
    ya:fat
)
SIZE(LARGE)

PY_SRCS(
    marks.py
)

PEERDIR(
    contrib/python/selenium
    mail/python/sendr-qtools
    pay/integration
)

TEST_SRCS(
    conftest.py
    test_payture.py
    test_rbs.py
    test_uniteller.py
)

INCLUDE(${ARCADIA_ROOT}/library/recipes/allure/recipe.inc)

END()
