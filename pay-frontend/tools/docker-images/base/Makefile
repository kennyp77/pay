DOCKER_IMAGE	?= registry.yandex.net/yandex-pay/frontend/base
DOCKER_TAG		?= stable

build:
	docker build --pull --no-cache -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

publish:
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: build publish
