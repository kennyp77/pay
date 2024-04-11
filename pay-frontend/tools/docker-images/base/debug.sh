#!/bin/bash

docker run -ti \
    --rm \
    \
    registry.yandex.net/yandex-pay/frontend/base:${TAG} /bin/bash
