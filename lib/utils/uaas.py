import base64
import binascii
import json
import json.decoder
from typing import Any, Dict, Optional, Set


class UaasParser:
    def __init__(self, headers, handler_name, logger):
        self.headers = headers
        self.handler_name = handler_name
        self.logger = logger
        self._exp_flags = {}
        self._testids = set()
        self._UAAS_ALL_HEADERS = {
            'X-Yandex-ExpConfigVersion',
            'X-Yandex-LogstatUID',
            'X-Yandex-ExpSplitParams',
            'X-Yandex-ExpBoxes',
            'X-Yandex-ExpBoxes-Pre',
            'X-Yandex-ExpBoxes-Crypted',
            'X-Yandex-ExpBoxes-Crypted-Pre',
            'X-Yandex-ExpFlags',
            'X-Yandex-ExpFlags-Pre',
        }
        self._log_headers()
        self._parse_flags()

    @property
    def exp_flags(self) -> Dict[str, Any]:
        return self._exp_flags

    @property
    def testids(self) -> Set:
        return self._testids

    def _parse_flags(self) -> Optional[Dict[str, Any]]:
        exp_flags_raw = self.headers.get('X-Yandex-ExpFlags')
        if not exp_flags_raw:
            self.logger.warning('No ExpFlags found')
            return None

        parsed_flags: Dict[str, Any] = {}
        triggered_testids: Set = set()

        for exp_flag_raw in exp_flags_raw.split(','):
            try:
                exp_flag = json.loads(base64.b64decode(exp_flag_raw))
            except (binascii.Error, json.decoder.JSONDecodeError):
                with self.logger:
                    self.logger.context_push(invalid_flag=exp_flag_raw)
                    self.logger.exception('Invalid exp flag')
                    continue

            for testitem in exp_flag:
                handler = testitem.get('HANDLER')
                if handler != self.handler_name:
                    continue

                testids = testitem.get('TESTID', [])  # Почему-то это list
                triggered_testids.update(testids)

                testitem_flags = self._get_testitem_flags(testitem)

                for key, value in testitem_flags.items():
                    if key in parsed_flags:
                        with self.logger:
                            self.logger.context_push(key=key, prev_value=parsed_flags[key], value=value)
                            self.logger.warning('Duplicate test flag')
                            continue
                    parsed_flags[key] = value

            self._testids = triggered_testids
            self._exp_flags = parsed_flags

        self.logger.context_push(triggered_testids=sorted(triggered_testids))
        with self.logger:
            self.logger.context_push(flags=parsed_flags)
            self.logger.info('UAAS flags parsed')
        return parsed_flags

    def _get_testitem_flags(self, testitem: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return testitem.get('CONTEXT', {}).get('MAIN', {}).get(self.handler_name, {})
        except (KeyError, AttributeError):
            self.logger.exception('Invalid test item content')
            return {}

    def _log_headers(self):
        uaas = {header: self.headers[header] for header in self._UAAS_ALL_HEADERS if header in self.headers}
        with self.logger:
            self.logger.context_push(uaas=uaas)
            self.logger.info('UAAS headers')
