FROM registry.yandex.net/data-ui/node-nginx:ubuntu20-nodejs14

COPY deploy/nginx /etc/nginx
COPY deploy/supervisor /etc/supervisor/conf.d

WORKDIR /opt/app

COPY . .

RUN npm ci --registry=https://registry.npmjs.org && \
    npm run build && \
    npm prune --production && \
    rm -rf /tmp/* /root/.npm

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
