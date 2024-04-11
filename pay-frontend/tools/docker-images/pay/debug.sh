#!/bin/bash

# @see https://github.yandex-team.ru/Billing/trust-frontend/blob/master/docs/dev-cert.md
SECRET_SSL=$(cat ${HOME}/.dev-cert/local-cert.pem | base64)

docker run -ti \
    --rm \
    -e "WEB_SERVICE_ENV=testing" \
    -e "DEPLOY_TVM_TOOL_URL='http://localhost:8001'" \
    -e "TVMTOOL_LOCAL_AUTHTOKEN=tvmtool-development-access-token" \
    -e "DUFFMAN_WORKERS=1" \
    -e "DUFFMAN_BASEPORT=8080" \
    -e "SECRET_KEY_PEM=$SECRET_SSL" \
    -e "SECRET_CERT_PEM=$SECRET_SSL" \
    -e "CSRF_KEY=1" \
    -p "8080:80" \
    -p "8443:443" \
    \
    registry.yandex.net/yandex-pay/frontend/pay-service:${TAG} /bin/bash
