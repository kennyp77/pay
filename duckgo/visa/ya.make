GO_LIBRARY()

OWNER(g:yandex-pay)

SRCS(
    client.go
    constants.go
    encryption.go
    signer.go
    types.go
    verifier.go
)

GO_TEST_SRCS(
    benchmark_signer_test.go
    signer_test.go
    verifier_test.go
)

END()

RECURSE(
    gotest
    visamock
    visatest
)
