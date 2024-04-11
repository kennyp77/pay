UNAME_S := $(shell uname -s)
migrations_root := /tmp/sprint-dev-migrations-root
arcadia_root := $(shell ya dump root)
params := $(wordlist 2,100,$(MAKECMDGOALS))
no_db_recipe := DB_USE_ARCADIA_RECIPE=False
source_root := Y_PYTHON_SOURCE_ROOT=$(arcadia_root)
entry_point := Y_PYTHON_ENTRY_POINT=":main"
pytest_args := -m pytest -p no:warnings -sv


# Code style
ya-style:
	ya style

check-isort:
	isort --recursive --check-only --diff sprint/

check-flake8:
	flake8 sprint/

check-style: check-flake8 check-isort

sort-imports:
	isort --recursive sprint/

mypy:
	MYPYPATH=$(arcadia_root) mypy -p sprint --show-traceback --disallow-incomplete-defs

cc: ya-style sort-imports check-style mypy


# Tests
test:
	ya make -r -tt --test-stdout

test-unit:
	ya make -r -tt --test-stdout sprint/tests/unit

test-functional:
	ya make -r -tt --test-stdout sprint/tests/functional

dev-unit:
	$(no_db_recipe) $(source_root) $(entry_point) ./sprint/tests/unit/pay-sprint-sprint-tests-unit $(pytest_args) $(if $(params),$(params),sprint/tests/unit)

dev-functional:
	$(no_db_recipe) $(source_root) $(entry_point) ./sprint/tests/functional/pay-sprint-sprint-tests-functional $(pytest_args) $(if $(params),$(params),sprint/tests/functional)


# Development
deps:
	ya make --checkout sprint && ya make --checkout sprint/tests

build_bin:
	ya make bin

build_docker: build_bin
	ya package package/package.json --docker --docker-repository pay/sprint --custom-version 0.0.0-$(shell date +"%s")

runserver:
	$(source_root) ./bin/sprint runserver

l_runserver:
	./run_local.sh make runserver

wl_runserver:
	./run_local.sh -w make runserver

runworkers:
	$(source_root) ./bin/sprint runworkers

l_runworkers:
	./run_local.sh make runworkers

wl_runworkers:
	./run_local.sh -w make runworkers

shell:
	$(source_root) ./bin/sprint shell

l_shell:
	./run_local.sh make shell

tunnel:
	ssh -D 4444 dev -N

# Deployment
yadeploy-production:
	ya tool dctl publish-draft stage ./deploy/yandexpay-sprint-production.deploy.yaml


# Database
start_db:
ifeq ($(UNAME_S),Linux)
	# докер в убунте не может делать bind volume на директорию аркадии, смонтированной через arc
	rm -rf $(migrations_root) && mkdir -p $(migrations_root) && cp -r ./postgre $(migrations_root)
	SPRINT_MIGRATIONS_ROOT=$(migrations_root) docker-compose up -d sprint_db sprint_db_migrated
else
	docker-compose up -d sprint_db sprint_db_migrated
endif

pgcli:
	PGPASSWORD="P@ssw0rd" pgcli -h localhost -p 5252 -U sprint -d sprint_db
