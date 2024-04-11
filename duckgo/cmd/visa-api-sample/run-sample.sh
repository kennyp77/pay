#!/usr/bin/env bash
YAV="ya vault"

#### LOAD VISA KEYS

export VISA_SIGNING_KEY_ID=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o InboundKey)
export VISA_SIGNING_KEY_SECRET=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o InboundSecret)
export VISA_ENCRYPTION_KEY_ID=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o EncryptionKey)
export VISA_ENCRYPTION_KEY_SECRET=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o EncryptionSecret)

if ! [ \
  -n "$VISA_SIGNING_KEY_ID" \
  -a -n "$VISA_SIGNING_KEY_SECRET" \
  -a -n "$VISA_ENCRYPTION_KEY_ID" \
  -a -n "$VISA_ENCRYPTION_KEY_SECRET" \
]
then
  echo 'some keys are missing'
  exit 1
fi

go build && ./visa-api-sample

