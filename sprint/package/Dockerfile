FROM registry.yandex.net/rtc-base/bionic:stable

RUN apt-get -y update \
    && apt-get -y install \
        lua-cjson \
        supervisor \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/lib/x86_64-linux-gnu/lua/ /usr/local/lib/lua

RUN mkdir -p /opt/bin
COPY pg-pinger /opt/bin
COPY nginx /opt/bin

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
    -subj "/C=RU/ST=Moscow/L=Moscow/O=Yandex/OU=SWAT/CN=localhost.msup.yandex.ru" \
    -keyout /etc/nginx/ssl/sprint.pem -out /etc/nginx/ssl/sprint.pem

COPY etc /etc
COPY entrypoint.sh /entrypoint.sh
COPY bin/sprint /opt/bin
COPY version.txt /version.txt

ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
