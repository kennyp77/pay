UNAME_S := $(shell uname -s)
migrations_root := /tmp/bill_payments-dev-migrations-root
arcadia_root := $(shell ya dump root)
params := $(wordlist 2,100,$(MAKECMDGOALS))
no_db_recipe := DB_USE_ARCADIA_RECIPE=False
source_root := Y_PYTHON_SOURCE_ROOT=$(arcadia_root)
entry_point := Y_PYTHON_ENTRY_POINT=":main"
pytest_args := -m pytest -p no:warnings -sv


# Code style

ya-style:
	ya style

mypy:
	MYPYPATH=$(arcadia_root) mypy -p pay.bill_payments --show-traceback --disallow-incomplete-defs

sort-imports:
	isort bill_payments/

check-isort:
	isort --check-only --diff bill_payments/

cc: sort-imports ya-style mypy


# Tests
test:
	ya make -tt --test-stdout

test-unit:
	ya make -tt --test-stdout bill_payments/tests/unit

test-functional:
	ya make -tt --test-stdout bill_payments/tests/functional

dev-unit:
	$(no_db_recipe) $(source_root) $(entry_point) ./python/python $(pytest_args) $(if $(params),$(params),bill_payments/tests/unit)

dev-functional:
	$(no_db_recipe) $(source_root) $(entry_point) ./python/python $(pytest_args) $(if $(params),$(params),bill_payments/tests/functional)


# Development
deps:
	ya make --checkout bill_payments && ya make --checkout bill_payments/tests

build_bin:
	ya make bin

build_docker: build_bin
	ya package package/package.json --docker --docker-repository pay/bill_payments --custom-version 0.0.0-$(shell date +"%s")

runserver:
	$(source_root) ./bin/bill_payments runserver

l_runserver:
	./run_local.sh make runserver

wl_runserver:
	./run_local.sh -w make runserver

runworkers:
	$(source_root) ./bin/bill_payments runworkers

l_runworkers:
	./run_local.sh make runworkers

wl_runworkers:
	./run_local.sh -w make runworkers

shell:
	$(source_root) ./bin/bill_payments shell

l_shell:
	./run_local.sh make shell

tunnel:
	# Определи алиас billpayments-dev в ~/.ssh/config
	ssh -D 4444 billpayments-dev -N


# Deployment
yadeploy-testing:
	ya tool dctl put stage ./deploy/bill-payments-testing.deploy.yaml

yadeploy-load:
	ya tool dctl put stage ./deploy/bill-payments-load.deploy.yaml

yadeploy-production:
	ya tool dctl publish-draft stage ./deploy/bill-payments-production.deploy.yaml

sync-deploy-spec:
	ya tool dctl get stage bill-payments-testing > ./deploy/bill-payments-testing.deploy.yaml
	ya tool dctl get stage bill-payments-production > ./deploy/bill-payments-production.deploy.yaml

# Database
start_db:
ifeq ($(UNAME_S),Linux)
	# докер в убунте не может делать bind volume на директорию аркадии, смонтированной через arc
	rm -rf $(migrations_root) && mkdir -p $(migrations_root) && cp -r ./postgre $(migrations_root)
	BILL_PAYMENTS_MIGRATIONS_ROOT=$(migrations_root) docker-compose up -d bill_payments_db bill_payments_db_migrated
else
	docker-compose up -d bill_payments_db bill_payments_db_migrated
endif

pgcli:
	PGPASSWORD="P@ssw0rd" pgcli -h localhost -p 5252 -U bill_payments -d bill_payments_db

restart_db:
	docker-compose rm --force --stop -v bill_payments_db bill_payments_db_migrate bill_payments_db_migrated
	make start_db
