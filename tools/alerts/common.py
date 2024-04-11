import json
import sys
import time
from copy import deepcopy
from dataclasses import dataclass
from enum import Enum, unique
from typing import Dict, List, Optional

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

ALERTS_KEY = 'yandexpay'
YANDEX_PAY_ABC = 'yandexpay'
YANDEX_PAY_NAMESPACE = 'yandex-pay'

FLAPS = {
    'boost': 0,
    'critical': 0,
    'stable': 0
}


class AmbryClient:
    """
    https://wiki.yandex-team.ru/golovan/userdocs/alerts/api/
    https://bb.yandex-team.ru/projects/SEARCH_INFRA/repos/yasm/browse/ambry
    """
    def __init__(self):
        self.session = requests.Session()
        self.yasm_host = 'https://yasm.yandex-team.ru'
        retries = Retry(total=3, backoff_factor=1.0, status_forcelist=[429, 500, 502, 503, 504])
        self.session.mount(self.yasm_host, HTTPAdapter(max_retries=retries))

    def _make_request(self, handle, request):
        url = f'{self.yasm_host}/{handle}'
        result = self.session.post(url, json=request)

        try:
            result_json = result.json()
            if isinstance(result_json, dict) and result_json.get('status') == 'error':
                print(json.dumps(result_json, indent=4))
                sys.exit(1)

        except ValueError as e:
            print(e)
            print(result)
            raise

        return result_json.get('response', {}).get('result', {})

    def replace_alerts(self, alerts, total_time, interval) -> bool:
        """
        https://wiki.yandex-team.ru/golovan/userdocs/alerts/api/#post../srvambry/alerts/replace
        """
        response = self._make_request('srvambry/alerts/replace/background', alerts)
        operation_id = response.get('operation_id')
        print(f'Got operation id {operation_id}')

        start = time.time()
        attempt = 0
        while time.time() - start < total_time:
            result = self._make_request('srvambry/alerts/replace/status', {'operation_id': operation_id})
            print('Attempt #{}:\t{}'.format(attempt, result))
            attempt += 1
            if result.get('status') != 'finished':
                time.sleep(interval)
            elif result.get('failed', False):
                print('Failed to build monitoring: {}'.format(result.get('message')))
                return False
            else:
                return True

        print('We waited {} seconds, background task still not finished'.format(time.time() - start))
        print('Contact yasm support https://st.yandex-team.ru/GOLOVANSUPPORT')
        return False


@dataclass
class AlertDocLink:
    """https://docs.yandex-team.ru/juggler/aggregates/basics#urls"""
    title: str
    url: str
    type: str


@unique
class Cluster(Enum):
    PRODUCTION = 'production'
    SANDBOX = 'sandbox'
    TESTING = 'testing'


class AlertFactory:
    def __init__(
        self,
        app: str,
        alert_tags: Dict[str, List[str]],
        juggler_tags: List[str],
        metagroup: str = 'ASEARCH',
        cluster_type: Cluster = Cluster.PRODUCTION,
    ):
        self.cluster_type = cluster_type
        self.mgroups = [metagroup]
        self.app = app
        self.alert_tags = alert_tags
        self.juggler_tags = juggler_tags
        self.juggler_tags.append(f'yandexpay_{cluster_type.value}')

    def _get_juggler_tags(self, alert_tags, disaster):
        juggler_tags = deepcopy(self.juggler_tags)

        for tag, values in alert_tags.items():
            juggler_tags.extend(map(lambda v: f'a_{tag}_{v}', values))

        if disaster and self.cluster_type == Cluster.PRODUCTION:
            juggler_tags.extend(['is_disaster', 'warden_alert_create_spi'])

        return juggler_tags

    def get(self, signal, thresholds, name, flaps=None, disaster=False,
            extra_tags: Optional[Dict[str, List[str]]] = None,
            doc_links: Optional[List[AlertDocLink]] = None):

        alert_name = name.replace(' ', '_')

        alert_tags = deepcopy(self.alert_tags)
        if extra_tags is not None:
            alert_tags.update(extra_tags)

        geo = alert_tags.get('geo', [])

        is_geo_specific = len(geo) == 1
        if is_geo_specific:
            signal_name = f'{geo[0]}_{alert_name}'
        else:
            signal_name = alert_name

        host_prefix = '' if 'pay.yandex' in self.app else 'yandexpay_'

        juggler_check = {
            'host': f'{host_prefix}{self.app}',
            'namespace': YANDEX_PAY_NAMESPACE,
            'service': signal_name,
            'flaps': FLAPS if flaps is None else flaps,
            'tags': self._get_juggler_tags(alert_tags, disaster),
            'children': [],
            'responsible': [],
            'notifications': [],
            'aggregator': 'logic_or',
            'aggregator_kwargs': {
                'unreach_service': [{
                    'check': 'yasm_alert:virtual-meta'
                }],
                'unreach_mode': 'force_ok',
                'nodata_mode': 'force_ok',
            }
        }
        if doc_links:
            meta = juggler_check.setdefault('meta', {})
            urls = meta.setdefault('urls', [])
            for link_spec in doc_links:
                urls.append({
                    'url': link_spec.url,
                    'title': link_spec.title,
                    'type': link_spec.type,
                })

        left, right = thresholds
        if left == right:
            raise Exception('Limits cant be equal {}->{},{}'.format(alert_name, left, right))

        if left is None:
            warn, crit = [None, None], [right, None]
        elif right is None:
            warn, crit = [left, None], [None, None]
        elif left < right:
            warn, crit = [left, right], [right, None]
        else:
            warn, crit = [right, left], [None, right]

        alert = {
            'name': f'{ALERTS_KEY}.{signal_name}_{self.app}',
            'signal': signal.replace('\n', '').replace(' ', ''),
            'tags': alert_tags,
            'crit': crit,
            'warn': warn,
            'juggler_check': juggler_check,
            'mgroups': self.mgroups,
            'description': '',
            'abc': YANDEX_PAY_ABC,
            'disaster': disaster
        }

        return alert
