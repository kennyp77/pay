package visa

import (
	"crypto/sha256"
	"encoding/json"
	"errors"
	"time"

	"gopkg.in/square/go-jose.v2"
)

type SharedKey struct {
	KeyID  string `json:"keyId"`
	Secret string `json:"secret"`
}

func (sk *SharedKey) Validate() error {
	if len(sk.Secret) == 0 {
		return errors.New("shared key secret is required")
	}
	if len(sk.KeyID) == 0 {
		return errors.New("shared key keyID is required")
	}
	return nil
}

type JWEEncrypter struct {
	Key *SharedKey
}

func (e *JWEEncrypter) DecryptAndUnmarshal(input string, v interface{}) error {
	data, err := e.Decrypt(input)
	if err != nil {
		return err
	}

	return json.Unmarshal(data, v)
}

func (e *JWEEncrypter) Decrypt(input string) ([]byte, error) {
	jwe, err := jose.ParseEncrypted(input)
	if err != nil {
		return nil, err
	}

	secret := sha256.Sum256([]byte(e.Key.Secret))
	data, err := jwe.Decrypt(secret[:])
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (e *JWEEncrypter) MarshalAndEncrypt(v interface{}) (string, error) {
	data, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	return e.Encrypt(string(data))
}

func (e *JWEEncrypter) Encrypt(payload string) (string, error) {
	iat := time.Now().Unix()

	opts := new(jose.EncrypterOptions)
	opts.WithHeader("kid", e.Key.KeyID)
	opts.WithHeader("iat", iat)
	opts.WithHeader("typ", "JOSE")
	opts.WithHeader("channelSecurityContext", "SHARED_SECRET")

	secret := sha256.Sum256([]byte(e.Key.Secret))
	encrypter, err := jose.NewEncrypter(jose.A256GCM, jose.Recipient{Algorithm: jose.A256GCMKW, Key: secret[:]}, opts)
	if err != nil {
		return "", err
	}

	object, err := encrypter.Encrypt([]byte(payload))
	if err != nil {
		return "", err
	}

	return object.CompactSerialize()
}
