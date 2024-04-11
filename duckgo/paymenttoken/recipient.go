package paymenttoken

import (
	"bytes"
	"crypto/ecdsa"
	"encoding/base64"
	"encoding/json"
	"fmt"

	hybrid "github.com/google/tink/go/hybrid/subtle"
	"github.com/google/tink/go/signature/subtle"
)

// Recipient is implementation of receiver.
type Recipient struct {
	recipientID           string
	senderID              string
	senderVerifyingKeySet *SenderVerifyingKeySet
	recipientPrivateKeys  []*hybrid.ECPrivateKey
}

// RecipientOption - general way to change recipient's default options
type RecipientOption interface {
	apply(*Recipient)
}

// WithFromSenderID - set non-default sender
func WithFromSenderID(senderID string) RecipientOption {
	return recipientOptionFunc(
		func(recipient *Recipient) {
			recipient.senderID = senderID
		})
}

// WithPrivateKey - add recipient private key
func WithPrivateKey(privateKey *ecdsa.PrivateKey) RecipientOption {
	return recipientOptionFunc(
		func(recipient *Recipient) {
			pkey := &hybrid.ECPrivateKey{
				PublicKey: hybrid.ECPublicKey{
					Curve: privateKey.Curve,
					Point: hybrid.ECPoint{
						X: privateKey.X,
						Y: privateKey.Y,
					},
				},
				D: privateKey.D,
			}
			recipient.recipientPrivateKeys = append(recipient.recipientPrivateKeys, pkey)
		})
}

// NewRecipient - creates client for token decoding
func NewRecipient(recipientID string, keyset *SenderVerifyingKeySet, opts ...RecipientOption) *Recipient {
	recipient := &Recipient{
		recipientID:           recipientID,
		senderID:              Yandex,
		senderVerifyingKeySet: keyset,
		recipientPrivateKeys:  make([]*hybrid.ECPrivateKey, 0),
	}
	for i := range opts {
		opts[i].apply(recipient)
	}
	return recipient
}

// UnsealObject - unseal message and parse it
func (r *Recipient) UnsealJSONMessage(serializedToken string, v interface{}) error {
	token, err := ParseToken(serializedToken)
	if err != nil {
		return err
	}

	objectBytes, err := r.Unseal(token)
	if err != nil {
		return err
	}
	return json.Unmarshal(objectBytes, v)
}

// Unseal - basic unseal method
func (r *Recipient) Unseal(token *Token) ([]byte, error) {
	err := token.validate()
	if err != nil {
		return nil, err
	}

	switch token.ProtocolVersion {
	case ecV2.protocolVersion:
	default:
		return nil, fmt.Errorf("paymenttoken: unsupported protocol version %s", token.ProtocolVersion)
	}

	messageBytes, err := r.verify(token)
	if err != nil {
		return nil, err
	}

	protocol, ok := protocolConfigs[token.ProtocolVersion]
	if !ok {
		return nil, fmt.Errorf("paymenttoken: possible bug, cant fing protocol %s", token.ProtocolVersion)
	}

	if protocol.isEncryptionRequired {
		signedMessage := new(SignedMessage)
		if err := json.Unmarshal(messageBytes, &signedMessage); err != nil {
			return nil, err
		}
		decrypted, err := r.tryDecrypt(signedMessage, []byte(r.senderID), protocol)
		if err != nil {
			return nil, err
		}
		messageBytes = decrypted
	}

	return messageBytes, nil
}

func (r *Recipient) verify(token *Token) ([]byte, error) {
	signature, err := base64.StdEncoding.DecodeString(token.Signature)
	if err != nil {
		return nil, err
	}
	signedBytes := toLengthValue(r.senderID, r.recipientID, string(token.ProtocolVersion), token.SignedMessage)

	verifyingKey, err := token.IntermediateSigningCert.validateAndGetSigningKey(r.senderID, token.ProtocolVersion, r.senderVerifyingKeySet)
	if err != nil {
		return nil, err
	}

	if err := r.verifySignature(verifyingKey, signature, signedBytes); err != nil {
		return nil, err
	}
	return []byte(token.SignedMessage), nil
}

func (r *Recipient) verifySignature(verifyingKey *ecdsa.PublicKey, signature []byte, signedBytes []byte) (err error) {
	verifier, err := subtle.NewECDSAVerifierFromPublicKey(hashAlgoSHA256, encodingDER, verifyingKey)
	if err != nil {
		return err
	}
	err = verifier.Verify(signature, signedBytes)
	if err == nil {
		return nil
	}

	return fmt.Errorf("paymenttoken: cannot verify signature")
}

func (r *Recipient) tryDecrypt(signedMessage *SignedMessage, contextInfo []byte, pvc protocolVersionConfig) (data []byte, err error) {
	var errs []error
	for i := range r.recipientPrivateKeys {
		data, err = r.decrypt(signedMessage, contextInfo, r.recipientPrivateKeys[i], pvc)
		if err == nil {
			return data, nil
		}
		errs = append(errs, err)
	}
	return nil, fmt.Errorf("paymenttoken: can't decrypt: %v", errs)
}

func (r *Recipient) decrypt(signedMessage *SignedMessage, contextInfo []byte, privateKey *hybrid.ECPrivateKey, pvc protocolVersionConfig) ([]byte, error) {
	demKemSize := pvc.aesCtrKeySize + pvc.hmacSha256KeySize
	ephemeralPublicKey, err := base64.StdEncoding.DecodeString(signedMessage.EphemeralPublicKey)
	if err != nil {
		return nil, err
	}

	demKey, err := eciesHKDFRecipientKEM(
		ephemeralPublicKey,
		hashAlgoSHA256,
		[]byte{},
		contextInfo,
		demKemSize,
		pointFormatUncompressed,
		privateKey)

	if err != nil {
		return nil, err
	}

	hmacSha256Key := demKey[pvc.aesCtrKeySize:]

	ciphertext, err := base64.StdEncoding.DecodeString(signedMessage.EncryptedMessage)
	if err != nil {
		return nil, err
	}
	computedTag, err := hmacSHA256(hmacSha256Key, ciphertext)
	if err != nil {
		return nil, err
	}

	expectedTag, err := base64.StdEncoding.DecodeString(signedMessage.Tag)
	if err != nil {
		return nil, err
	}

	if !bytes.Equal(expectedTag, computedTag) {
		return nil, fmt.Errorf("paymenttoken: cannot decrypt; invalid MAC")
	}

	aesCtrKey := demKey[:pvc.aesCtrKeySize]
	return aesCTR(aesCtrKey, ciphertext)
}

type recipientOptionFunc func(*Recipient)

func (f recipientOptionFunc) apply(recipient *Recipient) {
	f(recipient)
}
