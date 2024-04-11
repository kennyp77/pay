package visa

type ProtectionType string

const (
	ProtectionTypeSoftware ProtectionType = "SOFTWARE"
	ProtectionTypeTEE      ProtectionType = "ProtectionTypeTEE"
	ProtectionTypeSE       ProtectionType = "ProtectionTypeSE"
	ProtectionTypeCloud    ProtectionType = "CLOUD"
)

func (p ProtectionType) IsValid() bool {
	switch p {
	case ProtectionTypeSoftware, ProtectionTypeCloud, ProtectionTypeTEE, ProtectionTypeSE:
		return true
	}
	return false
}

type PANSource string

const (
	PANSourceOnfile              PANSource = "ONFILE"
	PANSourceManuallyEntered     PANSource = "MANUALLYENTERED"
	PANSourceIssuerPushProvision PANSource = "ISSUER_PUSH_PROVISION"
	PANSourceTokenForToken       PANSource = "TOKEN_FOR_TOKEN"
)

func (p PANSource) IsValid() bool {
	switch p {
	case PANSourceOnfile, PANSourceManuallyEntered:
		return true
	}
	return false
}

type AccountType string

const (
	AccountTypeWallet AccountType = "WALLET"
	AccountTypeGuest  AccountType = "GUEST"
)

func (a AccountType) IsValid() bool {
	switch a {
	case AccountTypeWallet, AccountTypeGuest:
		return true
	}
	return false
}

type ConsumerEntryMode string

const (
	ConsumerEntryModeKeyEntered     ConsumerEntryMode = "KEYENTERED"
	ConsumerEntryModeCameraCaptured ConsumerEntryMode = "CAMERACAPTURED"
)

func (e ConsumerEntryMode) IsValid() bool {
	switch e {
	case ConsumerEntryModeKeyEntered, ConsumerEntryModeCameraCaptured:
		return true
	}
	return false
}

type YesNo string

const (
	VisaBoolTrue  YesNo = "Y"
	VisaBoolFalse YesNo = "N"
)

func (v YesNo) IsValid() bool {
	switch v {
	case VisaBoolTrue, VisaBoolFalse:
		return true
	}
	return false
}

func (v YesNo) Boolean() bool {
	return v == VisaBoolTrue
}

type AddressVerificationCode string

const (
	AddressVerificationCodeVerified             AddressVerificationCode = "Y" //verified,addressandpostalcodedata
	AddressVerificationCodeVerifiedPartitial1   AddressVerificationCode = "P" //verified,partialmatch(eitheraddressor postal code data match, but no result from the other)
	AddressVerificationCodeVerifiedPartitial2   AddressVerificationCode = "B" //verified,partialmatch(eitheraddressor postal code data match, but the other could not be verified due to incompatible format)
	AddressVerificationCodeVerifiedNoPostalCode AddressVerificationCode = "N" //verified,neitheraddressnorpostalcode data match
	AddressVerificationCodeNotPossible          AddressVerificationCode = "U" //verificationnotpossible(issuerdoesnot participate)
	AddressVerificationCodeDuplicate            AddressVerificationCode = "D" //verificationnotperformedduetoduplicate
)

func (a AddressVerificationCode) IsValid() bool {
	switch a {
	case AddressVerificationCodeVerified, AddressVerificationCodeVerifiedPartitial1, AddressVerificationCodeVerifiedPartitial2,
		AddressVerificationCodeVerifiedNoPostalCode, AddressVerificationCodeNotPossible, AddressVerificationCodeDuplicate:
		return true
	}
	return false
}

func (a AddressVerificationCode) IsVerified() bool {
	switch a {
	case AddressVerificationCodeVerified, AddressVerificationCodeVerifiedPartitial1, AddressVerificationCodeVerifiedPartitial2,
		AddressVerificationCodeVerifiedNoPostalCode:
		return true
	case AddressVerificationCodeNotPossible, AddressVerificationCodeDuplicate:
		return false
	}
	panic("unexpected AddressVerificationCode value")
}

type CVV2VerificationCode string

const (
	CVV2VerificationCodeCVV2Datamatch                          CVV2VerificationCode = "M"
	CVV2VerificationCodeNegativeDatamatch                      CVV2VerificationCode = "N"
	CVV2VerificationCodeVerificationNotPossible                CVV2VerificationCode = "U"
	CVV2VerificationCodeVerificationNotPerformedDueToDuplicate CVV2VerificationCode = "D"
)

func (c CVV2VerificationCode) IsValid() bool {
	switch c {
	case CVV2VerificationCodeCVV2Datamatch, CVV2VerificationCodeNegativeDatamatch, CVV2VerificationCodeVerificationNotPossible,
		CVV2VerificationCodeVerificationNotPerformedDueToDuplicate:
		return true
	}
	return false
}

func (c CVV2VerificationCode) IsVerified() bool {
	switch c {
	case CVV2VerificationCodeCVV2Datamatch, CVV2VerificationCodeNegativeDatamatch:
		return true
	case CVV2VerificationCodeVerificationNotPossible, CVV2VerificationCodeVerificationNotPerformedDueToDuplicate:
		return false
	}
	panic("unexpected CVV2VerificationCode value")
}

type TokenStatus string

const (
	TokenStatusActive    TokenStatus = "ACTIVE"
	TokenStatusInactive  TokenStatus = "INACTIVE"
	TokenStatusSuspended TokenStatus = "SUSPENDED"
	TokenStatusDeleted   TokenStatus = "DELETED"
)

func (t TokenStatus) IsValid() bool {
	switch t {
	case TokenStatusActive, TokenStatusInactive, TokenStatusSuspended, TokenStatusDeleted:
		return true
	}
	return false
}

func (t TokenStatus) IsActive() bool {
	return t == TokenStatusActive
}

type ParamsStatusValue string

const (
	ParamsStatusValueCurrent  ParamsStatusValue = "CURRENT"
	ParamsStatusValueObsolete ParamsStatusValue = "OBSOLETE"
)

func (s ParamsStatusValue) IsValid() bool {
	switch s {
	case ParamsStatusValueCurrent, ParamsStatusValueObsolete:
		return true
	}
	return false
}

type ParamsStatusReason string

const (
	ParamsStatusReasonTreasholdExeeded ParamsStatusReason = "THRESHOLD_EXCEEDED"
	ParamsStatusReasonKeyExpired       ParamsStatusReason = "KEY_EXPIRED"
)

func (s ParamsStatusReason) IsValid() bool {
	switch s {
	case ParamsStatusReasonTreasholdExeeded, ParamsStatusReasonKeyExpired:
		return true
	}
	return false
}

type CryptogramType string

const (
	CryptogramTypeTAVV  CryptogramType = "TAVV"
	CryptogramTypeCTAVV CryptogramType = "CTAVV"
	CryptogramTypeDTVV  CryptogramType = "DTVV"
)

func (c CryptogramType) IsValid() bool {
	switch c {
	case CryptogramTypeTAVV, CryptogramTypeCTAVV, CryptogramTypeDTVV:
		return true
	}
	return false
}

type TransactionType string

const (
	TransactionTypeECOM      TransactionType = "ECOM"
	TransactionTypeRECURRING TransactionType = "RECURRING"
	TransactionTypePOS       TransactionType = "POS"
	TransactionTypeAFT       TransactionType = "AFT"
)

func (c TransactionType) IsValid() bool {
	switch c {
	case TransactionTypeECOM, TransactionTypeRECURRING, TransactionTypePOS, TransactionTypeAFT:
		return true
	}
	return false
}
