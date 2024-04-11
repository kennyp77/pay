package zapsyslog

import (
	"fmt"
	"log/syslog"

	"go.uber.org/zap/zapcore"
)

var _ zapcore.Core = &Core{}

type Core struct {
	zapcore.LevelEnabler
	encoder zapcore.Encoder
	writer  *syslog.Writer
}

func New(enabler zapcore.LevelEnabler, encoder zapcore.Encoder, writer *syslog.Writer) *Core {
	return &Core{
		LevelEnabler: enabler,
		encoder:      encoder,
		writer:       writer,
	}
}

func (c *Core) With(fields []zapcore.Field) zapcore.Core {
	clone := &Core{
		LevelEnabler: c.LevelEnabler,
		encoder:      c.encoder.Clone(),
		writer:       c.writer,
	}

	for _, field := range fields {
		field.AddTo(clone.encoder)
	}

	return clone
}

func (c *Core) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if c.Enabled(entry.Level) {
		return checked.AddCore(entry, c)
	}
	return checked
}

func (c *Core) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buffer, err := c.encoder.EncodeEntry(entry, fields)
	if err != nil {
		return fmt.Errorf("zapsyslog: failed to encode log: %w", err)
	}
	defer buffer.Free()

	message := buffer.String()

	// Write the message.
	switch entry.Level {
	case zapcore.DebugLevel:
		return c.writer.Debug(message)

	case zapcore.InfoLevel:
		return c.writer.Info(message)

	case zapcore.WarnLevel:
		return c.writer.Warning(message)

	case zapcore.ErrorLevel:
		return c.writer.Err(message)

	case zapcore.DPanicLevel:
		return c.writer.Crit(message)

	case zapcore.PanicLevel:
		return c.writer.Crit(message)

	case zapcore.FatalLevel:
		return c.writer.Crit(message)

	default:
		return fmt.Errorf("zapsyslog: unknown log level: %v", entry.Level)
	}
}

func (c *Core) Sync() error {
	return nil
}
