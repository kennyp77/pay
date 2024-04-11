FROM registry.yandex.net/yandex-pay/frontend/base:npm7-stable

EXPOSE 80
EXPOSE 443

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION}

COPY tools/docker-images/pay/fs /

COPY server /usr/src/web-service/

RUN chmod 755 /opt/*.sh \
  \
  # Зависимости для компиляции node-биндингов
  # Они нужны только для комполяции и ниже мы их убираем
  && apt-get update \
  && apt-get install -y -q --no-install-recommends --no-install-suggests \
    build-essential \
  \
  && cd /usr/src/web-service \
  && npm install --production --unsafe-perm \
  && npm run compile \
  # Уменьшаем размер образа убирая неиспользуемые компоненты
  # чтобы container-diff работал быстрее
  && mv node_modules/@yandex-lego/serp-header/dist/base/user2.desktop.js /tmp/user2.desktop.js \
  && rm -r node_modules/@yandex-lego && mkdir -p node_modules/@yandex-lego/serp-header/dist/base \
  && mv /tmp/user2.desktop.js node_modules/@yandex-lego/serp-header/dist/base/user2.desktop.js \
  && npm cache clean --force \
  \
  && apt-get remove --purge --auto-remove -y \
    build-essential \
  && apt-get clean \
  \
  && rm -rf \
    /var/log/alternatives.log \
    /var/log/apt/history.log \
    /var/log/apt/term.log \
    /var/log/apt/eipp.log.* \
    /var/log/dpkg.log \
    /root/.config/configstore/update-notifier-npm.json \
    /root/.npm/anonymous-cli-metrics.json \
    /var/cache/ldconfig/aux-cache \
    /var/lib/apt/lists/*

COPY services/sdk/dist /usr/src/public/sdk/v1
COPY services/sdk-payment-method/dist /usr/src/public/sdk/v1/payment-method
COPY services/pay-form/dist /usr/src/public/form
COPY services/console/dist /usr/src/public/console
COPY services/console-registration/dist /usr/src/public/console-registration
COPY services/checkout/dist /usr/src/public/checkout
COPY services/playground/dist /usr/src/public/playground
COPY services/mobile-api-assets/dist /usr/src/public/mobile-api-assets
