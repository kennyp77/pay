package paymenttoken

import (
	"crypto/ecdsa"
	"encoding/base64"
	"errors"
	"fmt"

	"gopkg.in/square/go-jose.v2"
)

type RecipientKeyVerifier struct {
	verificationKeys []*ecdsa.PublicKey
}

// NewRecipientKeyVerifier creates new RecipientKeyVerifier
func NewRecipientKeyVerifier(verificationKeys []*ecdsa.PublicKey) *RecipientKeyVerifier {
	return &RecipientKeyVerifier{
		verificationKeys: verificationKeys,
	}
}

// Verify returns verified ECDSA Public Key.
// pubKey - base64-encoded key in PKIX, ASN.1 DER form.
// signature - product of RecipientKeySigner.Sign.
func (r *RecipientKeyVerifier) Verify(pubKey string, signature string) (*ecdsa.PublicKey, error) {
	derBytes, err := base64.StdEncoding.DecodeString(pubKey)
	if err != nil {
		return nil, err
	}

	if err = r.verify(derBytes, signature); err != nil {
		return nil, err
	}

	return ParseECPublicKey(derBytes)
}

func (r *RecipientKeyVerifier) verify(payload []byte, signature string) error {
	if signature == "" {
		return errors.New("paymenttoken: recipient key verifier: empty signature")
	}

	jws, err := jose.ParseDetached(signature, payload)
	if err != nil {
		return fmt.Errorf("paymenttoken: recipient key verifier: can't parse signature: %w", err)
	}

	for _, key := range r.verificationKeys {
		_, err = jws.Verify(key)
		if err == nil {
			break
		}
	}

	if err != nil {
		err = fmt.Errorf("paymenttoken: recipient key verifier: can't verify signature: %w", err)
	}

	return err
}
