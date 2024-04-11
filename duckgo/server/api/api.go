package api

import (
	"encoding/json"
	"io"
)

const (
	StatusSuccess = "success"
	StatusFail    = "fail"
)

type Response struct {
	Status string      `json:"status"` // "success" or "fail"
	Code   int         `json:"code"`   // HTTP status code
	Data   interface{} `json:"data"`   // Response-specific JSON-serializable data
}

type ErrorData struct {
	Message Code        `json:"message"` // Error string code
	Params  interface{} `json:"params"`  // Message-specific params
}

type GenericErrorParams struct {
	Description string `json:"description"`
}

func WriteGenericError(w io.Writer, code int, messageCode Code, description string) error {
	resp := Response{
		Status: StatusFail,
		Code:   code,
		Data: &ErrorData{
			Message: messageCode,
			Params: &GenericErrorParams{
				Description: description,
			},
		},
	}

	enc := json.NewEncoder(w)
	return enc.Encode(&resp)
}
