DOCKER_IMAGE	?= registry.yandex.net/yandex-pay/frontend/pay-service

build:
	npm ci
	S3_STATIC=true npm run build
	docker build --pull --no-cache --build-arg BUILD_VERSION=$(BUILD_VERSION) -t $(DOCKER_IMAGE):$(DOCKER_TAG) -f ./tools/docker-images/pay/Dockerfile .

publish:
	YENV=production S3_STATIC=true npm run deploy:static
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

local-build:
	npm run build
	docker build --pull --no-cache --build-arg BUILD_VERSION=$(BUILD_VERSION) -t $(DOCKER_IMAGE):$(DOCKER_TAG) -f ./tools/docker-images/pay/Dockerfile .
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: build publish local-build
