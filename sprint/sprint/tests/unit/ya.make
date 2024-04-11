OWNER(hmnid)

IF(NOT SANITIZER_TYPE)
    PY3TEST()

    SIZE(MEDIUM)

    INCLUDE(${ARCADIA_ROOT}/billing/library/recipes/pg/recipe.inc)
    USE_RECIPE(billing/library/recipes/pg/pg pay/sprint/postgre)
    DATA(
        arcadia/pay/sprint/postgre
    )


    PEERDIR(
        pay/sprint/sprint/tests
    )

    TEST_SRCS(
        conftest.py
        api/test_ping.py
    )

    END()
ENDIF()
