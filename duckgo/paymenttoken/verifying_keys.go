package paymenttoken

import (
	"crypto/ecdsa"
	"encoding/json"
	"time"
)

// SenderVerifyingKeySet is root CA public keys
type SenderVerifyingKeySet struct {
	Keys []*SenderVerifyingKey
}

func NewSenderVerifyingKeySet(keys ...*SenderVerifyingKey) *SenderVerifyingKeySet {
	return &SenderVerifyingKeySet{Keys: keys}
}

type SenderVerifyingKey struct {
	ProtocolVersion ProtocolVersion
	PublicKey       *ecdsa.PublicKey
	ExpirationTime  time.Time
}

// ParseSenderVerifyingKeys - parse trusted keys
func ParseSenderVerifyingKeys(data string) (*SenderVerifyingKeySet, error) {
	var keys []*SenderVerifyingKey
	parsed := &parsedVerifyingKeySet{}
	if err := json.Unmarshal([]byte(data), &parsed); err != nil {
		return nil, err
	}

	now := time.Now()
	for i := range parsed.Keys {
		key, err := parseVerifyingKey(&parsed.Keys[i])
		if err != nil {
			return nil, err
		}
		if key.ExpirationTime.Before(now) {
			// Ignore expired keys
			continue
		}
		keys = append(keys, key)
	}
	return &SenderVerifyingKeySet{Keys: keys}, nil
}

func (h *SenderVerifyingKeySet) Get(protocolVersion ProtocolVersion) []*ecdsa.PublicKey {
	var keys []*ecdsa.PublicKey

	for _, key := range h.Keys {
		if key.ProtocolVersion != protocolVersion {
			continue
		}
		keys = append(keys, key.PublicKey)
	}

	return keys
}

// parsedVerifyingKeySet is raw representation of SenderVerifyingKeySet
type parsedVerifyingKeySet struct {
	Keys []parsedVerifyingKey `json:"keys"`
}

type parsedVerifyingKey struct {
	KeyValue        string          `json:"keyValue"`
	KeyExpiration   string          `json:"keyExpiration"`
	ProtocolVersion ProtocolVersion `json:"protocolVersion"`
}

func parseVerifyingKey(key *parsedVerifyingKey) (*SenderVerifyingKey, error) {
	expireTime, err := parseTimestampInMilliseconds(key.KeyExpiration)
	if err != nil {
		return nil, err
	}

	publicKey, err := ParseB64ECPublicKey(key.KeyValue)
	if err != nil {
		return nil, err
	}

	return &SenderVerifyingKey{
		ProtocolVersion: key.ProtocolVersion,
		ExpirationTime:  expireTime,
		PublicKey:       publicKey,
	}, nil
}
