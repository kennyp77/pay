reverse-tunnel:
	ssh -R '*:8080:localhost:8080' ${REMOTE_VPS} -N

sort-imports:
	isort .

ya-style:
	ya style

mypy:
	MYPYPATH=$(arcadia_root) mypy -p pay.dummy_merchant_api_server

cc: ya-style sort-imports mypy

build:
	ya make ./bin

run: build
	./bin/dummy_merchant_api_server

.PHONY: reverse-tunnel cc ya-style sort-imports mypy build run
