package api

type Code string

const (
	CodeInternal                 Code = "INTERNAL"
	CodeInvalidRequest           Code = "INVALID_REQUEST"
	CodeInvalidCard              Code = "INVALID_CARD"
	CodeInvalidBody              Code = "INVALID_BODY"
	CodeInvalidURL               Code = "INVALID_URL"
	CodeInvalidSignature         Code = "INVALID_SIGNATURE"
	CodeInvalidPublicKey         Code = "INVALID_PUBLIC_KEY"
	CodeInvalidRecipientID       Code = "INVALID_RECIPIENT_ID"
	CodeInvalidMessageExpiration Code = "INVALID_MESSAGE_EXPIRATION"
	CodeInvalidMessageID         Code = "INVALID_MESSAGE_ID"
	CodeInvalidGatewayMerchantID Code = "INVALID_GATEWAY_MERCHANT_ID"
)
