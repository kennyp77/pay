TAG_PREFIX = tags/releases/pay/duckgo/
RELEASE_TAG = $(TAG_PREFIX)/v$(VERSION)
RELEASE_BRANCH = releases/pay/duckgo/v$(VERSION)
ARC_ROOT = `arc root`

all: changelog release deb


changelog:
	test $(VERSION)
	./scripts/generate-changelog.sh $(VERSION) > debian/changelog.new
	echo >> debian/changelog.new
	cat debian/changelog >> debian/changelog.new
	mv debian/changelog.new debian/changelog
	arc diff debian/changelog


release:
	test $(VERSION)
	arc add debian/changelog
	arc commit -m "Version $(VERSION)"
	arc fetch $(TAG_PREFIX)
	arc checkout -b $(RELEASE_BRANCH)
	arc push HEAD:$(RELEASE_TAG)


deb:
	test $(VERSION)

	echo Build deb package for version $(VERSION)
	arc checkout $(RELEASE_TAG)

	docker build -t yandexpay/duckgo:build . -f debian/Dockerfile.build
	docker run --rm -v ~/.gnupg:/root/.gnupg \
		-v ~/.dupload.conf:/root/.dupload.conf \
		-v $(ARC_ROOT):/arcadia \
		-v /run/host-services/ssh-auth.sock:/run/host-services/ssh-auth.sock \
		-e GPG_TTY=/dev/console \
		-e SSH_AUTH_SOCK="/run/host-services/ssh-auth.sock" \
		-e VERSION=$(VERSION) \
		-e USER=$(USER) \
		-it yandexpay/duckgo:build /bin/bash

build-sandbox:
	test $(VERSION)
	docker build --build-arg VERSION=$(VERSION) -t yandex-pay/duckgo-sandbox:build . -f sandbox/Dockerfile

deploy-sandbox:
	test $(VERSION)
	docker tag yandex-pay/duckgo-sandbox:build registry.yandex.net/yandex-pay/duckgo-sandbox:$(VERSION)
	docker push registry.yandex.net/yandex-pay/duckgo-sandbox:$(VERSION)

release-sandbox: build-sandbox deploy-sandbox

configs/config.yml: example-configs/config.yml
	./scripts/generate-local-config.bash ./configs

run-server: configs/config.yml
	./scripts/run-local.bash go run cmd/duckgo/main.go -config ./configs/config.yml

# Команда предназначена для запуска duck внутри виртуальной docker сети компонентов Billing/docker-trust.
# Полезна для тестирования связки Ya.Pay backend -> card-pyproxy-tokenizer -> duckgo.
# Для card-pyproxy-tokenizer необходимо так же в components.cfg добавить компонент duckgo, как в https://st.yandex-team.ru/YANDEXPAY-200
run-trust-nw: configs/config.yml
	docker run ${ADDITIONAL_VARS} --network-alias duckgo --network trust_nw_local -p 1867:1867 -p 2020:2020 -it --rm -v ~/go:/root/go golang:1.16 bash -c 'cd /root/go/src/a.yandex-team.ru/pay/duckgo; make run-server'

.PHONY: run-server run-trust-nw release changelog deb
