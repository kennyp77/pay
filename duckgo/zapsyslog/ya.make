GO_LIBRARY()

OWNER(g:yandex-pay)

SRCS(zapsyslog.go)

GO_TEST_SRCS(zapsyslog_test.go)

END()

RECURSE(gotest)
