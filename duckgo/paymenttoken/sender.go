package paymenttoken

import (
	"crypto/ecdsa"
	"encoding/base64"
	"encoding/json"
	"fmt"

	hybrid "github.com/google/tink/go/hybrid/subtle"
	sign "github.com/google/tink/go/signature/subtle"
)

// Sender - basic class fot token signing/encryption
type Sender struct {
	pvc                     protocolVersionConfig
	signer                  *sign.ECDSASigner
	senderID                string
	intermediateSigningCert *IntermediateSigningCert
}

// SenderOption - general way to change sender options
type SenderOption interface {
	apply(*Sender)
}

// WithSenderID - set non-default sender
func WithSenderID(senderID string) SenderOption {
	return senderOptionFunc(
		func(sender *Sender) {
			sender.senderID = senderID
		})
}

// NewSender - create sender with protocol v2
func NewSender(senderIntermediateSigningKey *ecdsa.PrivateKey, intermediateSigningCert *IntermediateSigningCert, opts ...SenderOption) (*Sender, error) {
	if senderIntermediateSigningKey == nil {
		return nil, fmt.Errorf("paymenttoken: must set sender's intermediate signing key")
	}

	signer, err := sign.NewECDSASignerFromPrivateKey(hashAlgoSHA256, encodingDER, senderIntermediateSigningKey)
	if err != nil {
		return nil, err
	}

	sender := &Sender{
		pvc:                     ecV2,
		signer:                  signer,
		intermediateSigningCert: intermediateSigningCert,
		senderID:                Yandex,
	}

	for i := range opts {
		opts[i].apply(sender)
	}
	return sender, nil
}

// Seal - seal any string message
func (ts *Sender) Seal(recipientID string, message []byte, recipientPublicKey *ecdsa.PublicKey) (*Token, error) {
	return ts.sealV1OrV2(recipientID, message, recipientPublicKey)
}

// SealJSONMessage - seal object, that can be marshaled to json
func (ts *Sender) SealJSONMessage(recipientID string, message interface{}, recipientPublicKey *ecdsa.PublicKey) (string, error) {
	obj, err := json.Marshal(message)
	if err != nil {
		return "", err
	}

	token, err := ts.Seal(recipientID, obj, recipientPublicKey)
	if err != nil {
		return "", err
	}

	return token.Serialize()
}

func (ts *Sender) sealV1OrV2(recipientID string, message []byte, recipientPublicKey *ecdsa.PublicKey) (*Token, error) {
	var signedMessage = message

	if ts.pvc.isEncryptionRequired {
		rpk := &hybrid.ECPublicKey{
			Curve: recipientPublicKey.Curve,
			Point: hybrid.ECPoint{
				X: recipientPublicKey.X,
				Y: recipientPublicKey.Y,
			},
		}

		tokenEncryptResult, err := ts.encrypt(message, []byte(ts.senderID), rpk)
		if err != nil {
			return nil, err
		}

		encryptedBytes, err := json.Marshal(tokenEncryptResult)
		if err != nil {
			return nil, err
		}

		signedMessage = encryptedBytes
	}
	return ts.signV1OrV2(recipientID, signedMessage)
}

func (ts *Sender) signV1OrV2(recipientID string, message []byte) (*Token, error) {
	msgString := string(message)
	toSignBytes := toLengthValue(ts.senderID, recipientID, string(ts.pvc.protocolVersion), msgString)
	signature, err := ts.signer.Sign(toSignBytes)
	if err != nil {
		return nil, err
	}

	return &Token{
		Type:                    Yandex,
		SignedMessage:           msgString,
		ProtocolVersion:         ts.pvc.protocolVersion,
		Signature:               base64.StdEncoding.EncodeToString(signature),
		IntermediateSigningCert: ts.intermediateSigningCert,
	}, nil
}

func (ts *Sender) encrypt(plaintext, contextInfo []byte, recipientPublicKey *hybrid.ECPublicKey) (*SignedMessage, error) {
	symmetricKeySize := ts.pvc.aesCtrKeySize + ts.pvc.hmacSha256KeySize
	kemKey, err := eciesHKDFSenderKEMKey(
		hashAlgoSHA256,
		[]byte{},
		contextInfo,
		symmetricKeySize,
		pointFormatUncompressed,
		recipientPublicKey,
	)
	if err != nil {
		return nil, err
	}

	aesCtrKey := kemKey.SymmetricKey[:ts.pvc.aesCtrKeySize]
	hmacKey := kemKey.SymmetricKey[ts.pvc.aesCtrKeySize:]

	ciphertext, err := aesCTR(aesCtrKey, plaintext)
	if err != nil {
		return nil, err
	}

	tag, err := hmacSHA256(hmacKey, ciphertext)
	if err != nil {
		return nil, err
	}

	return &SignedMessage{
		EncryptedMessage:   base64.StdEncoding.EncodeToString(ciphertext),
		Tag:                base64.StdEncoding.EncodeToString(tag),
		EphemeralPublicKey: base64.StdEncoding.EncodeToString(kemKey.Kem),
	}, nil
}

type senderOptionFunc func(*Sender)

func (f senderOptionFunc) apply(sender *Sender) {
	f(sender)
}
