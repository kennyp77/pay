#!/usr/bin/env python
from json import dumps
from uuid import UUID, uuid4
import argparse
import json
import hashlib
import subprocess
import urllib3
from urllib3.exceptions import InsecureRequestWarning

import requests
from colorama import Fore


parser = argparse.ArgumentParser("create_pay_merchant")
parser.add_argument("--env", help="sandbox/testing/prod", type=str, required=True)
parser.add_argument("--merchant-id", help="Omit to generate a new one", type=str)
parser.add_argument("--name", help="sandbox/testing/prod", type=str, required=True)
parser.add_argument("--origin", help="e.g. --origin https://test.ru --origin https://www.test.ru", action='append', type=str, default=[])
parser.add_argument("--callback-url", help="https://callback.test", type=str, default=None)
parser.add_argument("--integration-psp-external-id", help="", type=str, default=None)
parser.add_argument("--integration-parameters", help="", type=str, default=None)
parser.add_argument("--delivery-integration-params", help="", type=str, default=None)
parser.add_argument("--check-only", help="", default=False, action='store_true')
parser.add_argument("--no-verify-tls", help="", default=False, action='store_true')
args = parser.parse_args()
env = args.env
merchant_id = UUID(args.merchant_id) if args.merchant_id else uuid4()
merchant_name = args.name
delivery_integration_params = json.loads(args.delivery_integration_params) if args.delivery_integration_params else None
origins = [{'origin': origin} for origin in args.origin]
callback_url = args.callback_url
verify_tls = not args.no_verify_tls

if args.integration_psp_external_id:
    assert args.integration_parameters

if not verify_tls:
    print(f'{Fore.YELLOW}! TLS verification disabled {Fore.RESET}')
    urllib3.disable_warnings(InsecureRequestWarning)

if env == 'sandbox':
    yapay_ticket_dst = 2026290
    yapayplus_ticket_dst = 2033545
    yapayint_base_url = 'https://sandbox.cards.int.pay.yandex.net'
    yapayplusint_base_url = 'https://sandbox.orders.int.pay.yandex.net'
    yapayadminapi = 'https://console.pay.yandex.ru'
elif env == 'production':
    yapay_ticket_dst = 2024741
    yapayplus_ticket_dst = 2029170
    # Дырки нет :( jump host?
    # yapayint_base_url = 'https://cards.int.pay.yandex.net'
    # yapayplusint_base_url = 'https://orders.int.pay.yandex.net'
    yapayint_base_url = 'https://4depfbxpr4gd5alm.sas.yp-c.yandex.net'
    yapayplusint_base_url = 'https://3v3d6fuwecawstw2.sas.yp-c.yandex.net'
    yapayadminapi = 'https://console.pay.yandex.ru'
elif env == 'testing':
    yapay_ticket_dst = 2024739
    yapayplus_ticket_dst = 2029082
    yapayint_base_url = 'https://test.cards.int.pay.yandex.net'
    yapayplusint_base_url = 'https://test.orders.int.pay.yandex.net'
    yapayadminapi = 'https://test.console.pay.yandex.ru'
else:
    raise Exception('Unknown env')


def get_service_ticket(src, dst):
    return subprocess.run(
        ['ya', 'tool', 'tvm', 'get_service_ticket', 'sshkey', '--src', str(src), '--dst', str(dst)], capture_output=True
    ).stdout.strip().decode('utf-8')


def get_psp_id(psp_external_id):
    return {
        'payture': UUID('678de147-6ff0-4171-8bf8-5796c7b717c3'),
        'mock': UUID('895cf90a-4530-4972-961e-4498e107f993'),
        'uniteller': UUID('7107ecf7-f825-4c79-b6a6-99606b358f47'),
        'alfabank': UUID('98452c0a-617b-4763-ad5f-a4cd81b3b258'),
        'rbs': UUID('769ab8d7-4fea-4b5e-891b-9fb5e126a015'),
    }[psp_external_id]


def do_request(method, url, json=None, headers=None):
    if method.lower() != 'get':
        print(f'{Fore.BLUE}>>>>OUTGOING REQUEST:{Fore.RESET}')
        print(f'        METHOD: {Fore.BLUE}{method}{Fore.RESET}')
        print(f'        URL: {Fore.GREEN}{url}{Fore.RESET}')
        print(f'        JSON: {dumps(json, ensure_ascii=False)}')
        prompt = input('Continue? [y/N]: ')
        if prompt != 'y':
            raise SystemExit()
    return requests.request(method=method, url=url, json=json, headers=headers, verify=verify_tls)


def encrypt_creds(psp_external_id: str, creds: dict[str, str]) -> str:
    if psp_external_id == 'mock':
        psp_external_id = 'payture'
        creds = {'key': 'invalid', 'password': 'invalid', 'gateway_merchant_id': 'invalid'}
    r = do_request(
        'post',
        f'{yapayadminapi}/api/web/v1/credentials/encrypt',
        json={
            'psp_external_id': psp_external_id,
            'creds': json.dumps(creds),
            'for_testing': env == 'sandbox',
        },
        headers={'x-ya-service-ticket': plus_ticket},
    )
    print('Cryptogram:', r.text)
    assert r.ok
    return r.json()['data']['cipher']

pay_ticket = get_service_ticket(src=yapay_ticket_dst, dst=yapay_ticket_dst)
plus_ticket = get_service_ticket(src=yapayplus_ticket_dst, dst=yapayplus_ticket_dst)

for url, back, ticket in (
    (f'{yapayplusint_base_url}/api/internal/v1/merchants/{merchant_id}', 'plus', plus_ticket),
    (f'{yapayint_base_url}/api/internal/v1/merchants/{merchant_id}', 'core', pay_ticket),
):
    r = do_request('get', url, headers={'x-ya-service-ticket': ticket})
    if r.ok:
        print(f'{Fore.YELLOW}! Merchant already exists in {back} backend{Fore.RESET}')
        print('    Merchant:', r.text)
        prompt = input('Continue? [y/N]: ')
        if prompt != 'y':
            raise SystemExit()
        break
    else:
        assert r.status_code == 404

if args.check_only:
    raise SystemExit()

print(f'{Fore.GREEN}* Adding to {Fore.RED}pay{Fore.GREEN} backend{Fore.RESET}')
r = do_request(
    'put',
    f'{yapayint_base_url}/api/internal/v1/merchants/{merchant_id}',
    json={
        'name': merchant_name,
        'origins': origins,
        'callback_url': callback_url,
    },
    headers={'x-ya-service-ticket': pay_ticket},
)
print('    Result:', r.text)
assert r.ok

print(f'{Fore.GREEN}* Adding to {Fore.RED}plus{Fore.GREEN} backend{Fore.RESET}')
r = do_request(
    'put',
    f'{yapayplusint_base_url}/api/internal/v1/merchants/{merchant_id}',
    json={
        'name': merchant_name,
        'origins': origins,
        'callback_url': callback_url,
        'delivery_integration_params': delivery_integration_params or {},
    },
    headers={'x-ya-service-ticket': plus_ticket},
)
print('    Result:', r.text)
assert r.ok

if args.integration_psp_external_id:
    assert args.integration_parameters
    integration_psp_external_id = args.integration_psp_external_id
    integration_psp_params = json.loads(args.integration_parameters)
    assert isinstance(integration_psp_params, dict)

    cryptogram = encrypt_creds(psp_external_id=integration_psp_external_id, creds=integration_psp_params)

    integration_id = UUID(bytes=hashlib.md5(merchant_id.bytes).digest()[:16], version=4)
    print(f'{Fore.GREEN}* Creating integration{Fore.RESET}')
    r = do_request(
        'patch',
        f'{yapayplusint_base_url}/api/internal/v1/integrations/{integration_id}',
        json={
            'merchant_id': str(merchant_id),
            'psp_id': str(get_psp_id(integration_psp_external_id)),
            'status': 'deployed',
            'creds': cryptogram,
            'enabled': True,
        },
        headers={'x-ya-service-ticket': plus_ticket},
    )
    print('    Integration:', r.text)
    assert r.ok
