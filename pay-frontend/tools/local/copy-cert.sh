#!/usr/bin/env bash

CERT_PATH=~/.dev-cert
CERT_NAME=local-cert.pem

SECRET_ID=sec-01fhsp7yy0k7sbpr0ncfa31f78
SECRET_KEY=7F0018D8D57447DC46A5154B6300020018D8D5_key_cert

if ! command -v yav &> /dev/null
then
    echo "yav command not found"
    echo "see https://vault-api.passport.yandex.net/docs/"
    return
fi

mkdir -p $CERT_PATH

echo "Copy new certificate"

yav get version $SECRET_ID -o $SECRET_KEY > $CERT_PATH/$CERT_NAME

echo "Done"
ls -l $CERT_PATH
