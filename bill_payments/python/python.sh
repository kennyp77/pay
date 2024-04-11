#!/usr/bin/env sh

# укажи меня в качестве Project Interpreter если используешь PyCharm

# PyCharm может ругаться на невалидную SDK, нужно указать полный путь до Аркадии, а не получать через ya dump root
export Y_PYTHON_SOURCE_ROOT="$(ya dump root)";

"${Y_PYTHON_SOURCE_ROOT}/pay/bill_payments/python/python" "$@"
