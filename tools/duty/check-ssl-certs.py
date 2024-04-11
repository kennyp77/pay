import requests
import socket
import ssl

from colorama import Fore, Style
from datetime import datetime, timedelta

ENDPOINTS = [
    'yandexpay-production.api',
    'yandexpay-sandbox.api',
    'yandexpay-testing.api',
    'yandexpay-production.api-internal',
    'yandexpay-sandbox.api-internal',
    'yandexpay-testing.api-internal',

    'yandexpay-plus-production.api',
    'yandexpay-plus-sandbox.api',
    'yandexpay-plus-testing.api',
    'yandexpay-plus-production.api-public',
    'yandexpay-plus-sandbox.api-public',
    'yandexpay-plus-testing.api-public',

    'yandexpay-admin-production.api',
    'yandexpay-admin-testing.api',
]

context = ssl.create_default_context()
context.check_hostname = False

for endpoint in ENDPOINTS:
    response = requests.request(
        url='http://sd.yandex.net:8080/resolve_endpoints/json',
        method='post',
        json={'endpoint_set_id': endpoint, 'cluster_name': 'sas', 'client_name': 'yandexpay'},
    )
    assert response.ok, response.text()
    addr = response.json()['endpoint_set']['endpoints'][0]['ip6_address']

    with socket.create_connection((addr, 443), 2.0) as sock:
        with context.wrap_socket(sock) as conn:
            ssl_info = conn.getpeercert()

    expires = datetime.strptime(ssl_info['notAfter'], r'%b %d %H:%M:%S %Y %Z')
    remaining = expires - datetime.utcnow()

    styled_endpoint = f'{Style.BRIGHT}{endpoint}{Style.RESET_ALL}'
    if remaining < timedelta(days=0):
        print(f'{styled_endpoint} {Fore.RED}EXPIRED{Fore.RESET}')
    elif remaining < timedelta(days=30):
        print(f'{styled_endpoint} {Fore.YELLOW}will expire in {remaining}{Fore.RESET}')
    else:
        print(f'{styled_endpoint} is {Fore.GREEN}fine{Fore.RESET}')
