arcadia_root := $(shell ya dump root)
params := $(wordlist 2,100,$(MAKECMDGOALS))
source_root := Y_PYTHON_SOURCE_ROOT=$(arcadia_root)
entry_point := Y_PYTHON_ENTRY_POINT=":main"
pytest_args := -m pytest -p no:warnings -sv

# Code style

ya-style:
	ya style

check-flake8:
	flake8 entities/ interactions/ schemas/

mypy:
	MYPYPATH=$(arcadia_root) mypy -p pay.lib --show-traceback --disallow-incomplete-defs

sort-imports:
	isort .

check-isort:
	isort --check-only --diff .

cc: sort-imports ya-style check-flake8 mypy

# Tests

build-tests:
	ya make tests

test:
	ya make -tt --test-stdout

dev-tests:
	$(source_root) $(entry_point) ./tests/pay-lib-tests $(pytest_args) $(if $(params),$(params),tests)
