#!/usr/bin/env bash

openssl genrsa -out cert.key 2048
openssl req -new -out cert.req -key cert.key -subj "/CN=localhost"
openssl x509 -req -in cert.req -out cert.cer -signkey cert.key -days 3650 -extfile cert.ext

# Print certificate
openssl x509 -in cert.cer -text -noout
