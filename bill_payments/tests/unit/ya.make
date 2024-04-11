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
        api/handlers/mixins/test_tvm.py
        api/handlers/test_bill.py
        api/handlers/test_document.py
        api/handlers/test_documents.py
        api/handlers/test_orders.py
        api/handlers/test_transactions.py
        api/handlers/webhooks/test_kazna_bill.py
        api/test_exceptions.py
        api/test_ping.py
        conftest.py
        core/actions/__init__.py
        core/actions/bill/__init__.py
        core/actions/bill/test_create.py
        core/actions/bill/test_force_search.py
        core/actions/bill/test_search.py
        core/actions/bill/test_state.py
        core/actions/document/__init__.py
        core/actions/document/test_create.py
        core/actions/document/test_delete.py
        core/actions/document/test_list.py
        core/actions/document/test_update.py
        core/actions/order/__init__.py
        core/actions/order/test_create.py
        core/actions/test_notify_user_new_bill.py
        core/actions/transaction/__init__.py
        core/actions/transaction/test_create.py
        core/actions/transaction/test_get.py
        core/actions/transaction/test_sync_transaction_status.py
        core/actions/transaction/test_update_status.py
        core/actions/user/__init__.py
        core/actions/user/test_create.py
        core/actions/user/test_ensure.py
        core/actions/user/test_get.py
        core/entities/test_bill.py
        interactions/test_kazna.py
        storage/entities/__init__.py
        storage/entities/test_bill.py
        storage/mappers/__init__.py
        storage/mappers/base.py
        storage/mappers/test_bill_order.py
        storage/mappers/test_bill.py
        storage/mappers/test_document.py
        storage/mappers/test_order.py
        storage/mappers/test_transaction.py
        storage/mappers/test_user.py
    )

    END()
ENDIF()
