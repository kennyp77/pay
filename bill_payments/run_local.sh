#!/usr/bin/env bash
if ! type pg-pinger > /dev/null 2>&1; then
    echo "pg-pinger not installed
    Build it from revision mentioned in changelog and add it to your PATH.
    https://a.yandex-team.ru/arc/trunk/arcadia/toolbox/pg-pinger/CHANGELOG.md
    "
    exit 1
fi

pkill -f "pg-pinger" || true

PINGER_HOSTS=0.0.0.0 \
    PINGER_PORT=5252 \
    PINGER_USERNAME=bill_payments \
    PINGER_PASSWORD="P@ssw0rd" \
    PINGER_DATABASE=bill_payments_db \
    PINGER_SSLMODE=disable \
    pg-pinger > /dev/null &

self_tvm_id=2031687

if [ -n "$self_tvm_id" ]
then
    export PYTHONPATH=./src
    [ -z "$TVMTOOL_UNITTEST" ] && export TVMTOOL_UNITTEST=0

    [[ -f ./.tvm.port ]] || echo $(( (RANDOM % 100) + 33300 )) > ./.tvm.port
    export TVM_PORT=$(cat ./.tvm.port)

    export TESTING_TVM_SECRET=$(cat ./.tvm.key)
    if [ "$TVMTOOL_UNITTEST" -eq 1 ]; then
        export TESTING_TVM_SECRET=fake_secret
    fi


    export DEPLOY_TVM_TOOL_URL="http://localhost:$TVM_PORT"
    export TVMTOOL_LOCAL_AUTHTOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    export TVM_CONFIG=$(
        jq -n --arg secret "$TESTING_TVM_SECRET" --argjson self_tvm_id "$self_tvm_id" '{
            "BbEnvType": 0,
            "clients": {
                "bill_payments": {
                    "secret": $secret,
                    "self_tvm_id": $self_tvm_id,
                    "dsts": {
                        "bill_payments": {
                            "dst_id": $self_tvm_id
                        },
                        "gozora": {
                            "dst_id": 2023123
                        },
                        "blackbox": {
                            "dst_id": 224
                        }
                    }
                }
            }
        }'
    )

    echo $TVM_CONFIG > .tvm.json
    # clean up prev. tvmtool run
    pkill -f "tvmtool.*$TVM_PORT" || true
    tvmtool $([ $TVMTOOL_UNITTEST -eq 1 ] && printf -- '--unittest') --port $TVM_PORT -a $TVMTOOL_LOCAL_AUTHTOKEN -c .tvm.json > /dev/null &
fi

make start_db

while [ "$1" != "" ]; do
    case $1 in
        -w  )
            shift
            exec watchmedo auto-restart -R -p "*.py;*.conf;*ya.make" -- "$@"
                                ;;
        * )
            exec "$@"
    esac
    shift
done
