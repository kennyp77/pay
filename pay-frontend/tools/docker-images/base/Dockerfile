FROM registry.yandex.net/rtc-base/bionic:sb-894945178

EXPOSE 80
EXPOSE 443

COPY fs /

ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8

# Настройка сертификатов, локали, TimeZone и прочих базовых сущностей.
RUN (wget -qO - http://dist.yandex.ru/yandexrepo/GPG-KEY-yandex | apt-key add -) \
    \
    && apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
      locales \
      tzdata \
      yandex-internal-root-ca \
      yandex-ca-certs \
      yandex-archive-keyring \
    \
    && echo 'Europe/Moscow' > /etc/timezone \
    && ln -sf /usr/share/zoneinfo/Europe/Moscow /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    \
    && locale-gen ru_RU.UTF-8 \
    && locale-gen en_US.UTF-8 \
    && dpkg-reconfigure -f noninteractive locales \
    \
    # Настройка ПО — nginx, nodejs и прочее ПО на базе которого работает проект.
    && apt-get install -y -q --no-install-recommends --no-install-suggests \
      make \
      \
      nginx=1.14.2-1.yandex.53 \
      nodejs-12=12.13.0-1 \
      \
    && ln -s /opt/nodejs/12/bin/npm /usr/local/bin/npm \
    && ln -s /opt/nodejs/12/bin/node /usr/local/bin/node \
    && npm install --global npm@7 \
    \
    && mkdir -p /secrets/ssl \
    && mkdir -p /var/spool/nginx \
    && mkdir -p /etc/nginx/keys \
    && mkdir -p /etc/nginx/ssl \
    \
    # Настройка окружения сервиса
    && apt-get install -y --no-install-recommends --no-install-suggests -o "Dpkg::Options::":="--force-confold" \
      tmux \
      cron \
      rsyslog \
      logrotate \
      supervisor \
      yandex-unified-agent \
      lua-cjson \
    && ln -sf /usr/lib/x86_64-linux-gnu/lua/ /usr/local/lib/lua \
    && mkdir -p /var/data/unified-agent-storages/ \
    && mkdir -p /var/log/duffman/ \
    && mkdir -p /var/log/nginx/web-service/ \
    \
    && chown syslog:adm /var/log/duffman/ \
    && chmod 755 /opt/entrypoint.sh \
    && chmod 755 /opt/workloads/*.sh \
    && chmod -R 644 /etc/logrotate.d/ \
    && chmod -R 644 /etc/cron.d/ \
    \
    # Пакеты для рантайма сервера
    && apt-get install -y -q --no-install-recommends --no-install-suggests \
      uatraits-data \
    && chmod -R 644 /usr/share/uatraits \
    \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    \
    # Fix 'Cannot make/remove an entry...' log spam
    # @see https://stackoverflow.com/a/43473861/1016033
    && sed -i '/pam_loginuid.so/s/^/#/' /etc/pam.d/cron

CMD ["/opt/entrypoint.sh"]
