package paymenttoken

// protocolVersionConfig - basic description of used protocol
type protocolVersionConfig struct {
	protocolVersion      ProtocolVersion
	aesCtrKeySize        uint32
	hmacSha256KeySize    uint32
	isEncryptionRequired bool
}

// ecV2 - predefined config for protocol version 2
var ecV2 = protocolVersionConfig{
	protocolVersion:      ProtocolVersionECv2,
	aesCtrKeySize:        256 / 8,
	hmacSha256KeySize:    256 / 8,
	isEncryptionRequired: true,
}

var protocolConfigs = map[ProtocolVersion]protocolVersionConfig{
	ecV2.protocolVersion: ecV2,
}
