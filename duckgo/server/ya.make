GO_LIBRARY()

OWNER(g:yandex-pay)

SRCS(
    config.go
    external_handlers.go
    healthcheck.go
    helpers.go
    internal_handlers.go
    middlewares.go
    server.go
)

GO_TEST_SRCS(
    config_test.go
    external_handlers_test.go
    helpers_test.go
    internal_handlers_test.go
    middlewares_test.go
    mocked_psp_test.go
    server_client_test.go
    testenv_test.go
    tvm_mock_test.go
)

END()

RECURSE(
    api
    gotest
)
