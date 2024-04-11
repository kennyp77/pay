package paymenttoken

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"encoding/binary"
	"fmt"

	hybrid "github.com/google/tink/go/hybrid/subtle"
	subtleMac "github.com/google/tink/go/mac/subtle"
	sign "github.com/google/tink/go/signature/subtle"
	"github.com/google/tink/go/subtle"
)

type kemKey struct {
	Kem, SymmetricKey []byte
}

func aesCTR(key []byte, plaintext []byte) (ciphertext []byte, err error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	iv := make([]byte, aes.BlockSize)
	ctr := cipher.NewCTR(block, iv)
	ciphertext = make([]byte, len(plaintext))
	ctr.XORKeyStream(ciphertext, plaintext)
	return
}

func hmacSHA256(hmacKey []byte, ciphertext []byte) (tag []byte, err error) {
	hmac, err := subtleMac.NewHMAC(hashAlgoSHA256, hmacKey, 32)
	if err != nil {
		return nil, err
	}

	tag, err = hmac.ComputeMAC(ciphertext)
	if err != nil {
		return nil, err
	}
	return
}

func eciesHKDFSenderKEMKey(hashAlg string, salt []byte, info []byte, keySize uint32, pointFormat string, recipientPublicKey *hybrid.ECPublicKey) (*kemKey, error) {
	pvt, err := hybrid.GenerateECDHKeyPair(recipientPublicKey.Curve)
	if err != nil {
		return nil, err
	}

	pub := pvt.PublicKey
	secret, err := hybrid.ComputeSharedSecret(&recipientPublicKey.Point, pvt)
	if err != nil {
		return nil, err
	}

	sdata, err := hybrid.PointEncode(pub.Curve, pointFormat, pub.Point)
	if err != nil {
		return nil, err
	}
	i := append(sdata, secret...)

	sKey, err := subtle.ComputeHKDF(hashAlg, i, salt, info, keySize)
	if err != nil {
		return nil, err
	}

	return &kemKey{
		Kem:          sdata,
		SymmetricKey: sKey,
	}, nil
}

func eciesHKDFRecipientKEM(kem []byte, hashAlg string, salt []byte, info []byte, keySize uint32, pointFormat string, recipientPrivateKey *hybrid.ECPrivateKey) ([]byte, error) {
	pubPoint, err := hybrid.PointDecode(recipientPrivateKey.PublicKey.Curve, pointFormat, kem)
	if err != nil {
		return nil, err
	}
	secret, err := hybrid.ComputeSharedSecret(pubPoint, recipientPrivateKey)
	if err != nil {
		return nil, err
	}
	i := append(kem, secret...)

	return subtle.ComputeHKDF(hashAlg, i, salt, info, keySize)
}

func toLengthValue(args ...string) []byte {
	buf := bytes.NewBuffer(nil)
	bs := make([]byte, 4)
	for i := range args {
		binary.LittleEndian.PutUint32(bs, uint32(len(args[i])))
		buf.Write(bs)
		_, _ = buf.WriteString(args[i])
	}
	return buf.Bytes()
}

func verifySignatures(pubKeys []*ecdsa.PublicKey, signatures [][]byte, signedBytes []byte) error {
	for _, pubKey := range pubKeys {
		verifier, err := sign.NewECDSAVerifierFromPublicKey(hashAlgoSHA256, encodingDER, pubKey)
		if err != nil {
			return err
		}
		for signatureID := range signatures {
			err := verifier.Verify(signatures[signatureID], signedBytes)
			if err == nil {
				return nil
			}
		}
	}

	return fmt.Errorf("paymenttoken: cannot verify signature")
}
