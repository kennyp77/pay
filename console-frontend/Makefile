DOCKER_IMAGE	?= registry.yandex.net/yandex-pay/frontend/pay-console-front

build:
	npm ci
	docker build --pull --no-cache -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

publish:
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

local-build:
	docker build --pull --no-cache -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: build publish local-build
