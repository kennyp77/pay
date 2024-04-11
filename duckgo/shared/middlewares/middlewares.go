package middlewares

import (
	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/ctxlog"
	"github.com/go-resty/resty/v2"
)

func NewResponseLogger(title string, logger log.Logger) resty.ResponseMiddleware {
	return func(c *resty.Client, res *resty.Response) error {
		ctxlog.Info(res.Request.Context(), logger, title,
			log.Int("http_status", res.StatusCode()),
			log.String("http_proto", res.RawResponse.Proto),
			log.Duration("http_elapsed_ms", res.Time()),
			log.String("http_request_uri", res.Request.URL),
		)

		return nil
	}
}
