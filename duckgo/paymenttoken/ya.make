GO_LIBRARY()

OWNER(g:yandex-pay)

SRCS(
    crypto_utils.go
    intermediate_signing_cert.go
    protocol_version_config.go
    recipient.go
    recipient_key_signer.go
    recipient_key_verifier.go
    sender.go
    token.go
    util.go
    verifying_keys.go
)

GO_TEST_SRCS(
    benchmark_test.go
    howto_test.go
    recipient_key_signer_test.go
    recipient_key_verifier_test.go
    sender_test.go
    utils_test.go
)

END()

RECURSE(gotest)
