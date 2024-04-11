OWNER(g:yandex-pay)

IF(NOT SANITIZER_TYPE)
    PY3TEST()

    SIZE(MEDIUM)

    INCLUDE(${ARCADIA_ROOT}/billing/library/recipes/pg/recipe.inc)
    USE_RECIPE(billing/library/recipes/pg/pg pay/bill_payments/postgre)
    DATA(
        arcadia/pay/bill_payments/postgre
    )

    PEERDIR(
        pay/bill_payments/bill_payments/tests
    )

    TEST_SRCS(
        api/handlers/__init__.py
        api/handlers/test_bill.py
        api/handlers/test_document.py
        api/handlers/test_documents.py
        api/handlers/test_search_bills.py
        api/handlers/test_transaction.py
        api/handlers/webhooks/__init__.py
        api/handlers/webhooks/test_kazna_payment_status.py
        conftest.py
        test_ping.py
    )

    END()
ENDIF()
