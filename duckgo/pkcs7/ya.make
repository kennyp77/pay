GO_LIBRARY()

OWNER(g:yandex-pay)

SRCS(
    encrypt.go
    pkcs7.go
)

GO_TEST_SRCS(encrypt_test.go)

END()

RECURSE(gotest)
