package visa

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	AuthorizationHeaderName     string = "x-pay-token"
	AuthorizationQueryParamName string = "apiKey"
)

var errorInvalidAPIKey = errors.New("visa: signer: provide valid api key")
var errorInvalidSecret = errors.New("visa: signer: provide valid secret")

// Signer represents the http request signer that holds the
// inbound key and inbound secret.
type Signer struct {
	key    string
	secret string
}

// SignerOption is a NewSigner constructor option
type SignerOption func(*Signer)

// WithSignerAPIKey is a constructor's option supplying api key to signer
// api key is passed to Visa via query params
func WithSignerAPIKey(key string) SignerOption {
	return func(s *Signer) {
		s.key = key
	}
}

// WithSignerSecret is a constructor's option supplying hmac secret to signer
// which is used to create signature header
func WithSignerSecret(secret string) SignerOption {
	return func(s *Signer) {
		s.secret = secret
	}
}

// NewSigner is a Visa Signer's consutrctor
func NewSigner(opts ...SignerOption) *Signer {
	signer := &Signer{}
	for _, opt := range opts {
		opt(signer)
	}

	if signer.key == "" {
		panic(errorInvalidAPIKey)
	}
	if signer.secret == "" {
		panic(errorInvalidSecret)
	}
	return signer
}

// Sign signs the http request. It generates the authorization header and sets
// authorization query parameters.
func (signer *Signer) Sign(req *http.Request) error {
	query := req.URL.Query()
	query.Set(AuthorizationQueryParamName, signer.key)
	req.URL.RawQuery = query.Encode()

	body, err := getRequestBody(req)
	if err != nil {
		return err
	}
	now := time.Now().Unix()
	authHeader := MakeAuthHeaderForTimestamp(now, req.URL, body, signer.secret)
	req.Header.Set(AuthorizationHeaderName, authHeader)
	return nil
}

// The getRequestBody extracts the body content from the given
// http request and returns in []byte format.
func getRequestBody(req *http.Request) ([]byte, error) {
	if req.Body == nil {
		return nil, nil
	}
	getBody, err := req.GetBody()
	if err != nil {
		return nil, err
	}
	return ioutil.ReadAll(getBody)
}

func MakeAuthHeaderForTimestamp(timestamp int64, u *url.URL, payload []byte, secret string) string {
	query := u.Query().Encode()
	path := strings.TrimPrefix(u.EscapedPath(), "/")
	timestampString := strconv.FormatInt(timestamp, 10)

	hmac := hmac.New(sha256.New, []byte(secret))
	// hmac implements hash.Hash interface, whereas hash.Hash implements io.Writer interface
	// but states what hash.Write will never return an error.
	_, _ = hmac.Write([]byte(timestampString))
	_, _ = hmac.Write([]byte(path))
	_, _ = hmac.Write([]byte(query))
	_, _ = hmac.Write(payload)
	signature := hex.EncodeToString(hmac.Sum(nil))
	token := "xv2:" + timestampString + ":" + signature
	return token
}

// AuthInterceptor implements http.RoundTripper interface. It signs every
// http request using provided signer.
type AuthInterceptor struct {
	rt     http.RoundTripper
	signer *Signer
}

var _ http.RoundTripper = &AuthInterceptor{}

// NewAuthInterceptor allocates new AuthInterceptor. If rt is nil,
// http.DefaultTransport is used.
func NewAuthInterceptor(signer *Signer, rt http.RoundTripper) *AuthInterceptor {
	if rt == nil {
		rt = http.DefaultTransport
	}
	return &AuthInterceptor{
		rt:     rt,
		signer: signer,
	}
}

// RoundTrip is the front-end RoundTripper which signs the request and passes
// the request to the underlying transport.
func (i *AuthInterceptor) RoundTrip(request *http.Request) (*http.Response, error) {
	err := i.signer.Sign(request)
	if err != nil {
		return nil, err
	}
	return i.rt.RoundTrip(request)
}
