package server

import (
	"context"
)

type HealthCheck struct {
	Name  string
	Check HealthCheckFunc
}

type HealthCheckFunc func(ctx context.Context) error
