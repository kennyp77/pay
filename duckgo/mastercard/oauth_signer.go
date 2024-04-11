package mastercard

import (
	"net/http"

	oauth "github.com/mastercard/oauth1-signer-go"
)

// OAuthInterceptor implements http.RoundTripper interface. It signs every
// http request using provided signer.
type OAuthInterceptor struct {
	rt     http.RoundTripper
	signer *oauth.Signer
}

var _ http.RoundTripper = &OAuthInterceptor{}

// NewOAuthInterceptor allocates new OAuthInterceptor. If rt is nil,
// http.DefaultTransport is used.
func NewOAuthInterceptor(signer *oauth.Signer, rt http.RoundTripper) *OAuthInterceptor {
	if rt == nil {
		rt = http.DefaultTransport
	}
	return &OAuthInterceptor{
		rt:     rt,
		signer: signer,
	}
}

func (i *OAuthInterceptor) RoundTrip(request *http.Request) (*http.Response, error) {
	err := i.signer.Sign(request)
	if err != nil {
		return nil, err
	}
	return i.rt.RoundTrip(request)
}
