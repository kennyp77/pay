#!/usr/bin/env bash
set -e

echo "Preparing keys for duck sandbox"

CONFIG_DIR=/etc/config

#. <(xargs -0 bash -c 'printf "export %q\n" "$@"' -- < /proc/$pid/environ)

# BEGIN VARS
# THALES_CARD_ENCRYPTION_DUMMY_CERT - thales card tokenization in sandbox environment is not a thing.
#     However, backend still fails to run if no thales cert was supplied - it is an important failsafe for production environment
#     Placing dummy well-formed x509 pretends-to-be-thales-cert cert should be fine.

MASTERCARD_SIGNING_KEY=$CONFIG_DIR/mastercard-sign-key.pem
MASTERCARD_ENCRYPTION_KEY=$CONFIG_DIR/mastercard-encryption-key.pem
MASTERCARD_ENCRYPTION_PUB_KEY=$CONFIG_DIR/mastercard-encryption-public-key.pem
PAYMENT_TOKEN_SIGNING_KEY=$CONFIG_DIR/intermediate.key.pem
PAYMENT_TOKEN_INTERMEDIATE_CERT=$CONFIG_DIR/intermediate.json
PAYMENT_TOKEN_VERIFICATION_KEY=$CONFIG_DIR/recipient-verification-key.pem
THALES_CARD_ENCRYPTION_DUMMY_CERT=$CONFIG_DIR/thales-encryption-cert.pem
# END VARS

mkdir -p "$CONFIG_DIR"

cat /config/local/API_Signing_Key_OAuth_key.p12 | openssl pkcs12 -nocerts -nodes -password "pass:$SIGNING_KEY_PASSWPRD" | sed -ne '/-BEGIN PRIVATE KEY-/,/-END PRIVATE KEY-/p' > $MASTERCARD_SIGNING_KEY
cat /config/local/Encryption_Key.p12 | openssl pkcs12 -nocerts -nodes -password "pass:$ENCRYPTION_KEY_PASSWORD" | sed -ne '/-BEGIN PRIVATE KEY-/,/-END PRIVATE KEY-/p' > $MASTERCARD_ENCRYPTION_KEY
cat /config/local/intermediate.key.pem > $PAYMENT_TOKEN_SIGNING_KEY
cat /config/local/intermediate.json > $PAYMENT_TOKEN_INTERMEDIATE_CERT
cat /config/local/recipient-verification-key.pem > $PAYMENT_TOKEN_VERIFICATION_KEY
openssl req -x509 -nodes -newkey rsa:4096 -keyout /tmp/dummy-key.pem -out "$THALES_CARD_ENCRYPTION_DUMMY_CERT" -sha256 -days 365000 -subj '/CN=duckgo.invalid' && rm /tmp/dummy-key.pem

openssl rsa -in $MASTERCARD_ENCRYPTION_KEY -pubout -out $MASTERCARD_ENCRYPTION_PUB_KEY

if ! [ \
     -n "$MASTERCARD_CLIENT_ID" \
  -a -n "$MASTERCARD_CONSUMER_KEY" \
  -a -n "$MASTERCARD_SERVICE_ID" \
  -a -s "$MASTERCARD_SIGNING_KEY" \
  -a -s "$MASTERCARD_ENCRYPTION_KEY" \
]
then
  echo 'Mastercard config parts was not generated successfully'
  exit 1
fi

if ! [ \
     -s "$PAYMENT_TOKEN_SIGNING_KEY" \
  -a -s "$PAYMENT_TOKEN_INTERMEDIATE_CERT" \
  -a -s "$PAYMENT_TOKEN_VERIFICATION_KEY" \
]
then
  echo 'Payment token config parts was not generated successfully'
  exit 1
fi

if ! [ \
     -n "$VISA_SIGNING_KEY_ID" \
  -a -n "$VISA_SIGNING_KEY_SECRET" \
  -a -n "$VISA_VERIFYING_KEY_ID" \
  -a -n "$VISA_VERIFYING_KEY_SECRET" \
  -a -n "$VISA_ENCRYPTION_KEY_ID" \
  -a -n "$VISA_ENCRYPTION_KEY_SECRET" \
]
then
  echo 'Visa config parts was not generated successfully'
  exit 1
fi

##### Generating config

cat > "$CONFIG_DIR/config.yml" <<EOF
  {
  "external_api": {
    "listen_addr": "localhost:1867",
    "auth": "shared_key",
    "shared_key": {
      "shared_key": "$DUCKGO_INTERNAL_SHARED_KEY"
    },
    "disable_tls": true,
  },
  "internal_api": {
    "listen_addr": "localhost:2020",
    "auth": "shared_key",
    "shared_key": {
        "shared_key": "$DUCKGO_INTERNAL_SHARED_KEY"
    }
  },
  "mastercard": {
    "api_host_url": "http://localhost:2021",
    "public_keys_url": "http://127.0.0.1:2021/keys",
    "keys_update_period" : "168h",

    # ConsumerKey provided by Mastercard. If empty, fallback to MASTERCARD_CONSUMER_KEY env var.
    "consumer_key": "$MASTERCARD_CONSUMER_KEY",

    # srcClientId provided by Mastercard. If empty, fallback to MASTERCARD_CLIENT_ID env var.
    "client_id": "$MASTERCARD_CLIENT_ID",

    # serviceID provided by Mastercard. If empty, fallback to MASTERCARD_SERVICE_ID env var.
    "service_id": "$MASTERCARD_SERVICE_ID",

    "signing_key_path": "$MASTERCARD_SIGNING_KEY",
    "encryption_key_path": "$MASTERCARD_ENCRYPTION_KEY",
  },
  "visa": {
    "client_app_id": "YandexPay",
    "api_host_url": "http://localhost:2022",
    "signing_key": {
         "key_id" : "$VISA_SIGNING_KEY_ID",
         "secret" : "$VISA_SIGNING_KEY_SECRET",
    },
    "encryption_key": {
      "key_id": "$VISA_ENCRYPTION_KEY_ID",
      "secret": "$VISA_ENCRYPTION_KEY_SECRET",
    },
    "verifying_keys": [{
      "key_id": "$VISA_VERIFYING_KEY_ID",
      "secret": "$VISA_VERIFYING_KEY_SECRET",
    }],
    "enroll_timeout": "16s",
  },
  "payment_token": {
    "signing_key_path": "$PAYMENT_TOKEN_SIGNING_KEY",
    "intermediate_cert_path": "$PAYMENT_TOKEN_INTERMEDIATE_CERT",
    "recipient_verification_public_keys": [
      "$PAYMENT_TOKEN_VERIFICATION_KEY",
    ],
  },
  "wallet": {
    "thales": {
        "card_encryption_cert_path": "$THALES_CARD_ENCRYPTION_DUMMY_CERT"
    }
  },
  "logger": {
    "level": "debug",
    "sink": "stdout",
  },
}
EOF
