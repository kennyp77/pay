package paymenttoken

import (
	"crypto/ecdsa"
	"crypto/x509"

	"github.com/jonboulle/clockwork"
	"gopkg.in/square/go-jose.v2"
)

func withRecipientKeySignerClock(clock clockwork.Clock) recipientKeySignerOption {
	return recipientKeySignerOptionFunc(func(signer *RecipientKeySigner) {
		signer.clock = clock
	})
}

type RecipientKeySigner struct {
	clock      clockwork.Clock
	signingKey jose.SigningKey
}

// NewRecipientKeySigner creates new RecipientKeySigner
func NewRecipientKeySigner(signingKey *ecdsa.PrivateKey, opts ...recipientKeySignerOption) *RecipientKeySigner {
	sig := jose.SigningKey{
		Algorithm: jose.ES256,
		Key:       signingKey,
	}

	signer := &RecipientKeySigner{
		clock:      clockwork.NewRealClock(),
		signingKey: sig,
	}

	for i := range opts {
		opts[i].apply(signer)
	}

	return signer
}

func (r *RecipientKeySigner) Sign(key *ecdsa.PublicKey) string {
	der, err := x509.MarshalPKIXPublicKey(key)
	if err != nil {
		panic(err)
	}

	return r.sign(der)
}

func (r *RecipientKeySigner) sign(payload []byte) string {
	iat := r.clock.Now().Unix()
	opts := (&jose.SignerOptions{EmbedJWK: true}).
		WithHeader("iat", iat)

	signer, err := jose.NewSigner(r.signingKey, opts)
	if err != nil {
		panic(err)
	}

	jws, err := signer.Sign(payload)
	if err != nil {
		panic(err)
	}

	signature, err := jws.DetachedCompactSerialize()
	if err != nil {
		panic(err)
	}

	return signature
}

type recipientKeySignerOption interface {
	apply(*RecipientKeySigner)
}

type recipientKeySignerOptionFunc func(*RecipientKeySigner)

func (f recipientKeySignerOptionFunc) apply(sig *RecipientKeySigner) {
	f(sig)
}
