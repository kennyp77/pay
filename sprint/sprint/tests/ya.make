OWNER(hmnid)

IF(NOT SANITIZER_TYPE)
    PY3_LIBRARY()

    PEERDIR(
        contrib/python/pytest-asyncio
        contrib/python/pytest-mock
        pay/sprint/sprint
        pay/sprint/postgre
    )

    PY_SRCS(
        common_conftest.py
        db.py
        utils.py
    )

    END()

    RECURSE_FOR_TESTS(
        functional
        unit
    )
ENDIF()
