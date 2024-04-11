package server

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"fmt"
	"net/http"
	"strings"
	"time"

	"a.yandex-team.ru/library/go/core/log"
	"a.yandex-team.ru/library/go/core/log/ctxlog"
	"a.yandex-team.ru/library/go/yandex/tvm"

	"github.com/go-chi/chi/v5/middleware"
)

// MiddlewareSharedKeyAuth implements a simple middleware handler for adding shared secret http auth to a route.
func MiddlewareSharedKeyAuth(sharedKey string) func(next http.Handler) http.Handler {
	localSecret := []byte(sharedKey)
	localSHA256 := []byte(fmt.Sprintf("%x", sha256.Sum256(localSecret)))
	return func(next http.Handler) http.Handler {
		authFailed := func(rw http.ResponseWriter) {
			rw.Header().Add("WWW-Authenticate", "SharedKey")
			rw.Header().Add("WWW-Authenticate", "SharedKeySHA256")
			rw.WriteHeader(http.StatusUnauthorized)
		}

		// Case insensitive prefix match.
		hasPrefix := func(s, prefix string) bool {
			return len(s) >= len(prefix) && strings.EqualFold(s[:len(prefix)], prefix)
		}

		return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
			if sharedKey == "" {
				authFailed(rw)
				return
			}

			auth := r.Header.Get("Authorization")
			if auth == "" {
				authFailed(rw)
				return
			}

			const (
				sharedKeyPrefix       = "SharedKey "
				sharedKeySHA256Prefix = "SharedKeySHA256 "
			)

			if hasPrefix(auth, sharedKeyPrefix) {
				remoteSecret := auth[len(sharedKeyPrefix):]
				if subtle.ConstantTimeCompare([]byte(remoteSecret), localSecret) != 1 {
					authFailed(rw)
					return
				}
			} else if hasPrefix(auth, sharedKeySHA256Prefix) {
				remoteHash := auth[len(sharedKeySHA256Prefix):]
				if subtle.ConstantTimeCompare([]byte(remoteHash), localSHA256) != 1 {
					authFailed(rw)
					return
				}
			} else {
				authFailed(rw)
				return
			}

			next.ServeHTTP(rw, r)
		})
	}
}

// MiddlewareTVMAuth implements middleware handler for adding TVM auth to a route.
func MiddlewareTVMAuth(logger log.Logger, tvmClient tvm.Client, allowed []tvm.ClientID) func(next http.Handler) http.Handler {
	const serviceTicketHeader = "X-Ya-Service-Ticket"

	allowedMap := map[tvm.ClientID]struct{}{}
	for _, tvmID := range allowed {
		allowedMap[tvmID] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		authFailed := func(rw http.ResponseWriter, err error) {
			rw.Header().Add("WWW-Authenticate", serviceTicketHeader)
			http.Error(rw, err.Error(), http.StatusUnauthorized)
		}

		fn := func(rw http.ResponseWriter, r *http.Request) {
			serviceTicketValue := r.Header.Get(serviceTicketHeader)
			if serviceTicketValue == "" {
				err := fmt.Errorf("tvm middleware: ticket not found in %s", serviceTicketHeader)
				ctxlog.Warn(r.Context(), logger, "Reject tvm auth", log.Error(err))
				authFailed(rw, err)
				return
			}

			ticket, err := tvmClient.CheckServiceTicket(r.Context(), serviceTicketValue)
			if err != nil {
				ctxlog.Warn(r.Context(), logger, "Reject tvm auth", log.Error(err))
				authFailed(rw, err)
				return
			}

			if _, found := allowedMap[ticket.SrcID]; !found {
				err := fmt.Errorf("tvm middleware: src_id %d not allowed", ticket.SrcID)
				ctxlog.Warn(r.Context(), logger, "Reject tvm auth", log.Error(err))
				authFailed(rw, err)
				return
			}

			next.ServeHTTP(rw, r)
		}
		return http.HandlerFunc(fn)
	}
}

type httpLogFormatter struct {
	logger log.Logger
}

func newHTTPLogFormatter(logger log.Logger) *httpLogFormatter {
	return &httpLogFormatter{
		logger: logger,
	}
}

type httpLogEntry struct {
	ctx    context.Context
	logger log.Logger
}

var (
	_ middleware.LogFormatter = &httpLogFormatter{}
	_ middleware.LogEntry     = &httpLogEntry{}
)

func (f *httpLogFormatter) NewLogEntry(r *http.Request) middleware.LogEntry {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}

	ctx := r.Context()
	logger := log.With(f.logger,
		log.String("http_scheme", scheme),
		log.String("http_method", r.Method),
		log.String("http_proto", r.Proto),
		log.String("http_remote_addr", r.RemoteAddr),
		log.String("http_user_agent", r.UserAgent()),
		log.String("http_host", r.Host),
		log.String("http_request_uri", r.RequestURI),
		log.String("remote_addr", r.RemoteAddr),
	)

	ctxlog.Debug(ctx, logger, "incoming HTTP request started")

	return &httpLogEntry{
		ctx:    ctx,
		logger: logger,
	}
}

func (e *httpLogEntry) Write(status, bytes int, _ http.Header, elapsed time.Duration, _ interface{}) {
	ctxlog.Info(e.ctx, e.logger, "incoming HTTP request complete",
		log.Int("http_status", status),
		log.Int("http_bytes_sent", bytes),
		log.Duration("http_elapsed_ms", elapsed),
	)
}

func (e *httpLogEntry) Panic(v interface{}, stack []byte) {
	ctxlog.Error(e.ctx, e.logger, "incoming HTTP request panic",
		log.String("stack", string(stack)),
		log.String("panic", fmt.Sprintf("%+v", v)),
	)
}

// LogRequestID is a middleware that injects a request_id log field into
// the context of each request.
func LogRequestID(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		requestID := middleware.GetReqID(ctx)
		ctx = ctxlog.WithFields(ctx, log.String("request_id", requestID))
		next.ServeHTTP(w, r.WithContext(ctx))
	}
	return http.HandlerFunc(fn)
}
