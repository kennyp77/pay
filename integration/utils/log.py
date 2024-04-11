import sys
import json
import logging
from traceback import format_exc

import pytest
import allure

from sendr_qlog.logging.formatters.base import BaseStructureFormatter
from sendr_utils import json_value

from pay.integration.conf import settings


def configure_logging():
    logging.config.dictConfig(settings.LOGGING)
    logging.root.setLevel(settings.LOG_LEVEL)


class AllureFormatter(BaseStructureFormatter):
    def _serialize(self, data):
        return data['message'], json.dumps(json_value(data))


class AllureHandler(logging.Handler):
    def emit(self, record):
        try:
            name, data = self.format(record)
            pytest.allure.attach(contents=data, name=name, type=allure.attach_type.JSON)
        except Exception as e:
            sys.stderr.write('AllureHandler error {0}\n{1}'.format(e, format_exc()))
