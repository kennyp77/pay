arcadia_root := $(shell ya dump root)
params := $(wordlist 2,100,$(MAKECMDGOALS))
custom_settings := PAY_INTEGRATION_CONFIG_FILE=$(arcadia_root)/pay/integration/override.conf
source_root := Y_PYTHON_SOURCE_ROOT=$(arcadia_root)
entry_point := Y_PYTHON_ENTRY_POINT=":main"
pytest_args := -m pytest -p no:warnings --disable-warnings -sv

run-tests-allure: run-tests-noerr
	rm -rf ./allure_report
	cp --recursive --dereference ./tests/test-results/py3test/testing_out_stuff/allure_report/ ./allure_report

show-allure:
	./run-allure.sh ./allure_report/index.html

build-tests:
	ya make ./tests

dev-tests:
	$(no_db_recipe) $(source_root) $(entry_point) $(custom_settings) ./tests/pay-integration-tests $(pytest_args) $(if $(params),$(params),test*)

run-tests-noerr:
	rm -rf ./tests/test-results/py3test/testing_out_stuff/allure_report/
	-$(custom_settings) ya make -ttt ./tests $(if $(params),$(params),test*)

reversetunnel:
	# Если хочешь поднять мерчанта локально, пригодится дев тачка
	# Это реверс туннель т.е. на remote-server поднимается порт и форвардится на локальную тачку
	# Указан hmnid-yandex-pay-testing.sas.yp-c.yandex.net можешь указать своё а можешь попроситься ко мне
	ssh -N -R '[::]:8080:localhost:8080' hmnid-yandex-pay-testing.sas.yp-c.yandex.net

cc:
	ya style -q ./

.PHONY: run-show-allure build-tests dev-tests run-tests reversetunnel
