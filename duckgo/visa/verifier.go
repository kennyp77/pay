package visa

import (
	"errors"
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const tokenValidPeriod = 5 * time.Minute

// Can validate signature of visa's requests
type Verifier struct {
	secrets map[string]string
}

// VerifierOption is a NewVerifier constructor option
type VerifierOption func(*Verifier)

// Adds key-secret pair to verifier
func WithNamedSecret(key, secret string) VerifierOption {
	if key == "" {
		panic(errors.New("visa: verifier secret key cant be empty"))
	}
	if secret == "" {
		panic(errors.New("visa: verifier secret cant be empty"))
	}

	return func(s *Verifier) {
		if _, has := s.secrets[key]; has {
			panic(fmt.Errorf("visa: api key %s exists already", key))
		}
		s.secrets[key] = secret
	}
}

// NewVerifier is a Visa Verifier's constructor
func NewVerifier(opts ...VerifierOption) *Verifier {
	verifier := &Verifier{}
	verifier.secrets = make(map[string]string)

	for _, opt := range opts {
		opt(verifier)
	}

	return verifier
}

func (verifier *Verifier) VerifyRequest(url *url.URL, body []byte, signature string) error {
	if signature == "" {
		return errors.New("visa: empty signature")
	}

	if url.Query().Get(AuthorizationQueryParamName) == "" {
		return errors.New("visa: apiKey is missing")
	}

	expectedKey := url.Query().Get(AuthorizationQueryParamName)
	secret, hasSecret := verifier.secrets[expectedKey]
	if !hasSecret {
		return fmt.Errorf("visa: missing apiKey %s", expectedKey)
	}

	parts := strings.Split(signature, ":")
	if len(parts) != 3 || parts[0] != "xv2" {
		return errors.New("visa: wrong signature format, 3 parts expected xv2:ts:sig")
	}

	timestampString := parts[1]
	ts, err := strconv.ParseInt(timestampString, 10, 64)
	if err != nil {
		return err
	}

	if time.Now().Unix()-ts > int64(tokenValidPeriod/time.Second) {
		return errors.New("visa: signature expired")
	}

	expected := MakeAuthHeaderForTimestamp(ts, url, body, secret)
	if expected != signature {
		return errors.New("visa: wrong signature")
	}

	return nil
}
