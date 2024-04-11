package interactionerror

import (
	"encoding/json"

	"a.yandex-team.ru/library/go/core/log"
)

type InteractionError interface {
	error
	LogFields() []log.Field
	CorrelationHeaders() map[string]string
	GetStatusCode() int
	GetRawMessage() json.RawMessage
}
