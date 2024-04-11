package paymenttoken

import (
	"crypto/ecdsa"
	"encoding/base64"
	"encoding/json"
	"strconv"
	"time"

	sign "github.com/google/tink/go/signature/subtle"
)

// IntermediateSigningCertFactory - factory to create signed IntermediateSigningCert
type IntermediateSigningCertFactory struct {
	signers                []*sign.ECDSASigner
	protocolVersion        ProtocolVersion
	senderID               string
	intermediateSigningKey string
	expirationTime         time.Time
}

// NewIntermediateSigningCertFactory - creates IntermediateSigningCertFactory
//
// intermediateSigningKey is signing public key in ASN.1 DER form, base64-encoded.
func NewIntermediateSigningCertFactory(senderSigningKeys []*ecdsa.PrivateKey, protocolVersion ProtocolVersion, senderID string, intermediateSigningKey string, expirationTime time.Time) (*IntermediateSigningCertFactory, error) {
	signers := make([]*sign.ECDSASigner, 0, len(senderSigningKeys))
	for i := range senderSigningKeys {
		signer, err := sign.NewECDSASignerFromPrivateKey(hashAlgoSHA256, encodingDER, senderSigningKeys[i])
		if err != nil {
			return nil, err
		}
		signers = append(signers, signer)
	}
	return &IntermediateSigningCertFactory{
		signers:                signers,
		protocolVersion:        protocolVersion,
		senderID:               senderID,
		intermediateSigningKey: intermediateSigningKey,
		expirationTime:         expirationTime,
	}, nil
}

// CreateIntermediateSigningCert - create signed cert
func (f *IntermediateSigningCertFactory) CreateIntermediateSigningCert() (*IntermediateSigningCert, error) {
	signedKey, err := json.Marshal(SignedKey{
		KeyValue:      f.intermediateSigningKey,
		KeyExpiration: strconv.FormatInt(f.expirationTime.UnixNano()/int64(time.Millisecond), 10),
	})
	if err != nil {
		return nil, err
	}

	signatures := make([]string, 0)
	toSignBytes := toLengthValue(f.senderID, string(f.protocolVersion), string(signedKey))

	for i := range f.signers {
		signature, err := f.signers[i].Sign(toSignBytes)
		if err != nil {
			return nil, err
		}
		signatures = append(signatures, base64.StdEncoding.EncodeToString(signature))
	}

	return &IntermediateSigningCert{
		SignedKey:  string(signedKey),
		Signatures: signatures,
	}, nil
}

func (cert *IntermediateSigningCert) validateAndGetSigningKey(
	senderID string,
	protocolVersion ProtocolVersion,
	verifyingKeys *SenderVerifyingKeySet,
) (
	*ecdsa.PublicKey, error,
) {
	if err := cert.validate(); err != nil {
		return nil, err
	}

	signatures := make([][]byte, 0, len(cert.Signatures))
	for i := range cert.Signatures {
		s, err := base64.StdEncoding.DecodeString(cert.Signatures[i])
		if err != nil {
			return nil, err
		}
		signatures = append(signatures, s)
	}
	signedBytes := toLengthValue(senderID, string(protocolVersion), cert.SignedKey)

	if err := verifySignatures(verifyingKeys.Get(protocolVersion), signatures, signedBytes); err != nil {
		return nil, err
	}

	signedKey := new(SignedKey)
	if err := json.Unmarshal([]byte(cert.SignedKey), signedKey); err != nil {
		return nil, err
	}

	if err := signedKey.validate(); err != nil {
		return nil, err
	}

	return ParseB64ECPublicKey(signedKey.KeyValue)
}
