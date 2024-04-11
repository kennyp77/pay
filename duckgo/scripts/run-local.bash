#!/usr/bin/env bash
export DUCKGO_INTERNAL_API_SHARED_KEY='in-123'
export DUCKGO_EXTERNAL_API_SHARED_KEY='ex-123'
export VISA_SIGNING_KEY_ID='vi-sign-id'
export VISA_SIGNING_KEY_SECRET='vi-sign-sec'
export VISA_VERIFYING_KEY_ID='vi-ver-id'
export VISA_VERIFYING_KEY_SECRET='vi-ver-sec'
export VISA_ENCRYPTION_KEY_ID='vi-enc-id'
export VISA_ENCRYPTION_KEY_SECRET='vi-enc-sec'

while [ "$1" != "" ]; do
    case $1 in
        -w  )
            shift
            exec watchmedo auto-restart -R -p "*.go;*.yml;*.yaml" -- "$@"
                                ;;
        * )
            exec "$@"
    esac
    shift
done
