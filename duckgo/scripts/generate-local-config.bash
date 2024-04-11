#!/usr/bin/env bash
INTERM_CA=dev
RECIPIENT_VERIFICATION_KEY=dev
while [ $# -gt 0 ]; do
  case $1 in
    --mastercard-mock)
      MASTERCARD_MOCK=YES
      shift
      ;;
    --debug)
      DEBUG=YES
      shift
      ;;
    --interm-ca-env)
      shift
      INTERM_CA=$1
      shift
      ;;
    --recipient-verification-key-env)
      shift
      RECIPIENT_VERIFICATION_KEY=$1
      shift
      ;;
    -*|--*)
      echo "Unknown argument $1"
      exit 1
      ;;
    *)
      CONFIG_DIR=$1
      shift
      ;;
  esac
done
if [ -z "$CONFIG_DIR" ]
then
  echo 'Usage: ./scripts/generate-local-config.sh ./configs-directory [--debug] [--mastercard-mock] [--interm-ca-env dev] [--recipient-verification-key-env dev]'
  exit 1
fi

if [ -n "$DEBUG" ]
then
  set -x
fi

EXAMPLE_CONFIG_DIR=./example-configs
YAV="ya vault"

# BEGIN VARS
MASTERCARD_CONSUMER_KEY=$($YAV get version 'sec-01emh06f766msbjwv7n2jkgkyh' -o 'API_Signing_Key_OAuth_key_Consumer_Key')
MASTERCARD_CLIENT_ID=$($YAV get version 'sec-01emh06f766msbjwv7n2jkgkyh' -o 'SRC_Client_ID')
MASTERCARD_SERVICE_ID=$($YAV get version 'sec-01emh06f766msbjwv7n2jkgkyh' -o 'ServiceID')
MASTERCARD_SIGNING_KEY=$CONFIG_DIR/mastercard-sign-key.pem
MASTERCARD_ENCRYPTION_KEY=$CONFIG_DIR/mastercard-encryption-key.pem
MASTERCARD_ENCRYPTION_PUB_KEY=$CONFIG_DIR/mastercard-encryption-public-key.pem
MASTERCARD_SERVICE_ID_FILE=$CONFIG_DIR/mastercard-service-id.txt
PAYMENT_TOKEN_SIGNING_KEY=$CONFIG_DIR/intermediate.key.pem
PAYMENT_TOKEN_INTERMEDIATE_CERT=$CONFIG_DIR/intermediate.json
PAYMENT_TOKEN_RECIPIENT_VERIFICATION_KEY=$CONFIG_DIR/recipient-verification-key.pem
PAYMENT_TOKEN_RECIPIENT_VERIFICATION_PRIVATE_KEY=$CONFIG_DIR/recipient-verification-priv-key.pem
THALES_CARD_ENCRYPTION_CERT_PATH=$CONFIG_DIR/thales-card-encryption-cert.pem

case $INTERM_CA in
  dev)
    INTERM_CA_SEC_ID=sec-01fma4jev0m2xsaz1dw39rt1b5
    ;;
  sandbox)
    INTERM_CA_SEC_ID=sec-01erya5rx2tpthggvrag6ah9j8
    ;;
  *)
      echo "Unknown interm-ca-env $INTERM_CA"
      exit 1
      ;;
esac

case $RECIPIENT_VERIFICATION_KEY in
  dev | test)
    RECIPIENT_VERIFICATION_KEY_SEC_ID=sec-01f2vcxqm82yjze8t03yf3jw2e
    ;;
  sandbox)
    RECIPIENT_VERIFICATION_KEY_SEC_ID=sec-01f7b1hycd5n79nn7ry62tb36q
    ;;
  *)
      echo "Unknown recipient-verification-env $RECIPIENT_VERIFICATION_KEY"
      exit 1
      ;;
esac
# END VARS

mkdir -p "$CONFIG_DIR"

##### LOAD Thales

$YAV get version 'sec-01fcaq49vmfeghmjnwcv30t930' -o 'EncryptionCert' > $THALES_CARD_ENCRYPTION_CERT_PATH


##### LOAD MasterCard CRYPTO


$YAV get version 'sec-01emh06f766msbjwv7n2jkgkyh' -o 'API_Signing_Key_OAuth_key.pem' > $MASTERCARD_SIGNING_KEY
$YAV get version 'sec-01emh06f766msbjwv7n2jkgkyh' -o 'Encryption_Key.pem' > $MASTERCARD_ENCRYPTION_KEY
openssl rsa -in $MASTERCARD_ENCRYPTION_KEY -pubout -out $MASTERCARD_ENCRYPTION_PUB_KEY

$YAV get version "$INTERM_CA_SEC_ID" -o 'intermediate.key.pem' > $PAYMENT_TOKEN_SIGNING_KEY
$YAV get version "$INTERM_CA_SEC_ID" -o 'intermediate.json' > $PAYMENT_TOKEN_INTERMEDIATE_CERT
$YAV get version "$RECIPIENT_VERIFICATION_KEY_SEC_ID" -o 'recipient-verification-key-pub.pem' > $PAYMENT_TOKEN_RECIPIENT_VERIFICATION_KEY
$YAV get version "$RECIPIENT_VERIFICATION_KEY_SEC_ID" -o 'recipient-verification-key-priv.pem' > $PAYMENT_TOKEN_RECIPIENT_VERIFICATION_PRIVATE_KEY
echo "$MASTERCARD_SERVICE_ID" > $MASTERCARD_SERVICE_ID_FILE


#### LOAD VISA KEYS

VISA_SIGNING_KEY_ID=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o InboundKey)
VISA_SIGNING_KEY_SECRET=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o InboundSecret)
VISA_VERIFYING_KEY_ID=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o OutboundKey)
VISA_VERIFYING_KEY_SECRET=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o OutboundSecret)
VISA_ENCRYPTION_KEY_ID=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o EncryptionKey)
VISA_ENCRYPTION_KEY_SECRET=$($YAV get version 'sec-01en08mttgb1zydtxf3yspxp1m' -o EncryptionSecret)

##### Generating config

if ! [ \
     -n "$MASTERCARD_CLIENT_ID" \
  -a -n "$MASTERCARD_CONSUMER_KEY" \
  -a -n "$MASTERCARD_SERVICE_ID" \
  -a -s "$MASTERCARD_SIGNING_KEY" \
  -a -s "$MASTERCARD_ENCRYPTION_KEY" \
  -a -s "$MASTERCARD_SERVICE_ID_FILE" \
  -a -s "$PAYMENT_TOKEN_SIGNING_KEY" \
  -a -s "$PAYMENT_TOKEN_INTERMEDIATE_CERT" \
  -a -s "$PAYMENT_TOKEN_RECIPIENT_VERIFICATION_KEY" \
  -a -s "$PAYMENT_TOKEN_RECIPIENT_VERIFICATION_PRIVATE_KEY" \
  -a -s "$THALES_CARD_ENCRYPTION_CERT_PATH" \
  -a -n "$VISA_SIGNING_KEY_ID" \
  -a -n "$VISA_SIGNING_KEY_SECRET" \
  -a -n "$VISA_VERIFYING_KEY_ID" \
  -a -n "$VISA_VERIFYING_KEY_SECRET" \
  -a -n "$VISA_ENCRYPTION_KEY_ID" \
  -a -n "$VISA_ENCRYPTION_KEY_SECRET" \
]
then
  echo 'Some config parts was not generated successfully'
  exit 1
fi

MASTERCARD_API_URL="https://sandbox.api.mastercard.com"
MASTERCARD_KEYS_URL="https://sandbox.src.mastercard.com/keys"
if [ "$MASTERCARD_MOCK" == "YES" ]; then
  MASTERCARD_API_URL="http://localhost:2021"
  MASTERCARD_KEYS_URL="http://localhost:2021/keys"
fi

cp "$CONFIG_DIR/config.yml" "$CONFIG_DIR/config.old.yml"
rm "$CONFIG_DIR/config.yml"

cat > "$CONFIG_DIR/config.yml" <<EOF
{
  "external_api": {
    "listen_addr": ":1867",
    "auth": "shared_key",
    "disable_tls": true,
    "tvm": {
      "self": "duckgo",
      "tvmtool_url": "http://host.docker.internal:33342",
      "auth_token": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "allowed": [100, 200],
    },
    "shared_key": {
      "shared_key": "duckgo-external-sharedkey",
    },
  },
  "internal_api": {
    "listen_addr": ":2020",
    "auth": "shared_key",
    "shared_key": {
      "shared_key": "duckgo-diehard-sharedkey",
    },
  },
  "mastercard": {
    "api_host_url": "$MASTERCARD_API_URL",
    "public_keys_url": "$MASTERCARD_KEYS_URL",
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
    "api_host_url": "https://cert.api.visa.com",
    "signing_key": {
         "key_id" : "$VISA_SIGNING_KEY_ID",
         "secret" : "$VISA_SIGNING_KEY_SECRET",
    },
    "verifying_keys": [
      {
         "key_id" : "$VISA_VERIFYING_KEY_ID",
         "secret" : "$VISA_VERIFYING_KEY_SECRET",
      }
    ],
    "encryption_key": {
      "key_id": "$VISA_ENCRYPTION_KEY_ID",
      "secret": "$VISA_ENCRYPTION_KEY_SECRET",
    },
    "enroll_timeout": "16s",
  },
  "payment_token": {
    "signing_key_path": "$PAYMENT_TOKEN_SIGNING_KEY",
    "intermediate_cert_path": "$PAYMENT_TOKEN_INTERMEDIATE_CERT",
    "recipient_verification_public_keys": [
      "$PAYMENT_TOKEN_RECIPIENT_VERIFICATION_KEY",
    ],
  },
  "wallet": {
    "thales": {
        "card_encryption_cert_path": "$THALES_CARD_ENCRYPTION_CERT_PATH"
    }
  },
  "logger": {
    "level": "debug",
    "sink": "stdout",
  },
}
EOF

