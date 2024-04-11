#!/usr/bin/env bash
function check_ephemeral() {
    mount | grep -q "/ephemeral"
}

function ephemeral_log {
# Usage: ephemeral_log foldername [user:group]
    if [ -z $1 ]; then
        echo "Directory is missing!"
        return 1
    fi
    rm -rf "/var/log/$1"
    mkdir -pv "/ephemeral/log/$1" || true
    ln -sfv "/ephemeral/log/$1" /var/log/
    ([[ $2 ]] && chown -Rv $2 /ephemeral/log/$1) || true
}

if [ -z "$ENVIRONMENT_TYPE" ]; then
  ENVIRONMENT_TYPE=$DEPLOY_STAGE_ID
fi

if [ -z "$APPLICATION_NAME" ]; then
  APPLICATION_NAME=$DEPLOY_UNIT_ID
fi

if [ -z "$ENVIRONMENT_TYPE" ]; then
  echo 'ENVIRONMENT_TYPE is not set'
  exit 1
fi

if [ -z "$APPLICATION_NAME" ]; then
  echo 'APPLICATION_NAME is not set'
  exit 1
fi

check_ephemeral && ephemeral_log nginx && ephemeral_log app && ephemeral_log pg-pinger && ephemeral_log app-python

if [ -z "$SKIP_NGINX" ]; then
    mkdir -p /etc/nginx/sites-enabled
    mkdir -p /var/lib/nginx

    ln -sf /etc/nginx/sites-available/unistat.conf /etc/nginx/sites-enabled/unistat.conf
    ln -sf /etc/nginx/sites-available/app/$ENVIRONMENT_TYPE.conf /etc/nginx/sites-enabled/app-$ENVIRONMENT_TYPE.conf
    ln -sf /etc/supervisor/conf-available/nginx.conf /etc/supervisor/conf.d/nginx.conf
fi

[ ! -z "$SKIP_PGPINGER" ] || ln -sf /etc/supervisor/conf-available/pg-pinger.conf /etc/supervisor/conf.d/pg-pinger.conf
ln -sf /etc/supervisor/conf-available/app/$APPLICATION_NAME.conf /etc/supervisor/conf.d/$APPLICATION_NAME.conf

exec "$@"

