#!/bin/bash

. /opt/workloads/utils/tools.sh

[[ -z "$WEB_SERVICE_ENV" ]] && echo "WEB_SERVICE_ENV not set, cannot start" && exit 1

[[ -z "$LOGBROKER_TOPIC" ]] && echo "LOGBROKER_TOPIC not set, cannot start" && exit 1

[[ -z "$DUFFMAN_BASEPORT" ]] && echo "DUFFMAN_BASEPORT not set, cannot start" && exit 1
[[ -z "$DUFFMAN_WORKERS" ]] && echo "DUFFMAN_WORKERS not set, cannot start" && exit 1

[[ -z "$SECRET_KEY_PEM" ]] && echo "SECRET_KEY_PEM not set, cannot start" && exit 1
[[ -z "$SECRET_CERT_PEM" ]] && echo "SECRET_CERT_PEM not set, cannot start" && exit 1


# copy ssl from env
copy-ssl $SECRET_KEY_PEM /etc/nginx/ssl/key.pem
copy-ssl $SECRET_CERT_PEM /etc/nginx/ssl/cert.pem

# enable web-service config
ln -sf /etc/nginx/sites-available/web-service.conf /etc/nginx/sites-enabled/web-service.conf
# enable unistat config
ln -sf /etc/nginx/sites-available/unistat.conf /etc/nginx/sites-enabled/unistat.conf

# prepare nginx config by env
python3 /opt/workloads/utils/nginx_config_prepare.py
# generate nginx upstream config
python3 /opt/workloads/utils/nginx_upstream_gen.py
[[ "$?" != 0 ]] && echo "Failed to generate nginx upstream config" && exit 1

# prepare topics
sed "s|%topic-prefix%|$LOGBROKER_TOPIC|g" /etc/unified-agent/config.tpl.yml > /etc/unified-agent/config.yml

# Жуткий хак
# на слабых (дев) машинах воркер не успевает полноценно стартонуть за 2 сек
sed -i "s|forkTimeout: 2000|forkTimeout: 5000|g" /usr/src/web-service/node_modules/@yandex-int/duffman/bin/www

# start supervisor
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf
