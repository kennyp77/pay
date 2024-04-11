#!/usr/bin/env bash

# Install YandexInternalRootCA.pem for node.js
# https://wiki.yandex-team.ru/security/ssl/sslclientfix/

CA_CERT_URL="https://crls.yandex.net/YandexInternalRootCA.crt"
DEFAULT_CA_CERT_PATH="~/.ssl/certs/YandexInternalRootCA.pem"

if [[ -z "${NODE_EXTRA_CA_CERTS}" ]]; then
    case "${SHELL}" in
        */bash)
            echo "export NODE_EXTRA_CA_CERTS=${DEFAULT_CA_CERT_PATH}" >> ~/.bash_profile
            source ~/.bash_profile
            PROFILE_FILE_NAME=".bash_profile"
            ;;
        */zsh)
            echo "export NODE_EXTRA_CA_CERTS=${DEFAULT_CA_CERT_PATH}" >> ~/.zshrc
            source ~/.zshrc
            PROFILE_FILE_NAME=".zshrc"
            ;;
        *)
            echo "export NODE_EXTRA_CA_CERTS=${DEFAULT_CA_CERT_PATH}" >> ~/.profile
            source ~/.profile
            PROFILE_FILE_NAME=".profile"
            ;;
    esac
fi

if [[ -z "${NODE_EXTRA_CA_CERTS}" ]]; then
    echo "> Enviroment variable \$NODE_EXTRA_CA_CERTS is not prepared propertly"
    exit 1
fi

if [[ -f "${NODE_EXTRA_CA_CERTS}" ]]; then
    echo "> YandexInternalRootCA was found at '${NODE_EXTRA_CA_CERTS}'. If node.js has any problems with unsigned https certificates, check this file and \$NODE_EXTRA_CA_CERTS."
else
    echo "> According to \$NODE_EXTRA_CA_CERTS, YandexInternalRootCA path is '${NODE_EXTRA_CA_CERTS}', but file can't be read."
    echo "> Trying to install the CA."

    CA_CERT_DIRNAME=$(dirname "${NODE_EXTRA_CA_CERTS}")
    mkdir -p "${CA_CERT_DIRNAME}" || true
    if [[ ! -d "${CA_CERT_DIRNAME}" ]]; then
        echo "> Can't create directory '${CA_CERT_DIRNAME}'. Create it manually and run this script again, or change \$NODE_EXTRA_CA_CERTS value"
        exit 2
    fi

    if [[ -n "$(which wget)" ]]; then
        wget "${CA_CERT_URL}" -O "${NODE_EXTRA_CA_CERTS}"
    elif [[ -n "$(which curl)" ]]; then
        curl "${CA_CERT_URL}" -o "${NODE_EXTRA_CA_CERTS}"
    else
        echo "> Please download CA manually from ${CA_CERT_URL} and save it as '${NODE_EXTRA_CA_CERTS}'. Then run this script again."
        exit 3
    fi

    echo "> YandexInternalRootCA successfully installed as '${NODE_EXTRA_CA_CERTS}'. If node.js has any problems with unsigned https certificates, check this file and \$NODE_EXTRA_CA_CERTS."
    echo "> Please restart your console or run 'source ~/${PROFILE_FILE_NAME}'"
fi
