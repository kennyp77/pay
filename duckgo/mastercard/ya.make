GO_LIBRARY()

OWNER(g:yandex-pay)

SRCS(
    client.go
    keys_manager.go
    oauth_signer.go
    schemas.go
)

GO_TEST_SRCS(keys_manager_test.go)

END()

RECURSE(
    gotest
    mastercardtest
    mcmock
)
