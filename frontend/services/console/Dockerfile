###############
# Build Image #
###############
FROM registry.yandex.net/toolbox/nodejs:16.13.2-bionic-minimal AS builder

WORKDIR /opt/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    software-properties-common

# Устанавливаем питон версии 3.6 для корректной работы node-gyp
RUN add-apt-repository -y -u ppa:deadsnakes/ppa && apt-get -y install python3.6
RUN ln -sf /usr/bin/python3.6 /usr/bin/python
RUN ln -sf /usr/bin/python3.6 /usr/bin/python3

COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY .npmrc .
COPY packages packages
COPY services/console/package.json services/console/package.json

# При установке через pnpm меняем store_dir и virtual-store-dir так, чтобы модули лежали в контексте докера
RUN npm install -g pnpm@6.28.0
RUN cd ./services/console && \
    pnpm run install:deps -- --store-dir=./.pnpm-store --virtual-store-dir=./node_modules/.pnpm --ignore-scripts --reporter=silent

COPY services/console/src services/console/src
COPY services/console/index.html services/console/index.html
COPY services/console/tsconfig.json services/console/tsconfig.json
COPY services/console/tsconfig.node.json services/console/tsconfig.node.json
COPY services/console/vite.config.ts services/console/vite.config.ts

ARG YENV=production
ARG PR_NUMBER

RUN YENV=$YENV PR_NUMBER=$PR_NUMBER CI=true pnpm run build --filter @yandex-pay/console...
RUN cd ./services/console && \
    pnpm run install:deps -- --prod --store-dir=./.pnpm-store --virtual-store-dir=./node_modules/.pnpm --reporter=silent

#################
# Runtime Image #
#################
FROM registry.yandex.net/toolbox/nodejs:16.13.2-bionic-minimal

WORKDIR /opt/app

RUN apt-get update && apt-get install yandex-unified-agent

# Копируем файлы, необходимые для работы сервера
COPY --from=builder /opt/app/.pnpm-store .pnpm-store
COPY --from=builder /opt/app/node_modules node_modules
COPY --from=builder /opt/app/services/console/dist services/console/dist
COPY --from=builder /opt/app/services/console/node_modules services/console/node_modules
COPY --from=builder /opt/app/services/console/package.json services/console/package.json

ENV PORT 80

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD curl --fail http://localhost:${PORT}/

CMD cd ./services/console && npm start
