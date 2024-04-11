#!/usr/bin/env python3
import argparse
import tempfile
import sys
import subprocess
import datetime
import logging
from http.client import HTTPConnection

import requests

DEFAULT_PAN = 5555555555555555
DEFAULT_TSP_CARD_ID = '97475bb9-6d5a-4324-9ef1-436685aa4beb'  # mastercard src sandbox
DEFAULT_SANDBOX_PUBKEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqNyr4Wncv1tx3Vu/DuPuA/wvuHkBjlSvb4/4ukoiH4CmXmSI63JpqrDT6uW1LH3Kg9bO4/oRA1t3E4CwWVH4rQ=='
DEFAULT_RECIPIENT_ID = 'yandex-trust'
EXTERNAL_SHARED_KEY = 'duckgo-external-sharedkey'
INTERNAL_SHARED_KEY = 'duckgo-diehard-sharedkey'

MODE_MASTERCARD = 'mastercard'
MODE_PAN = 'pan'


def main():
    parser = argparse.ArgumentParser(
        prog='duckgo-get-token',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument('--pan', type=str, default=DEFAULT_PAN)
    parser.add_argument('--tsp-card-id', type=str, default=DEFAULT_TSP_CARD_ID)
    parser.add_argument('--recipient-pub-key', type=str, default=DEFAULT_SANDBOX_PUBKEY)
    parser.add_argument('--recipient-id', type=str, default=DEFAULT_RECIPIENT_ID)
    parser.add_argument('--ntokens', type=int, default=1)
    parser.add_argument('--gateway-merchant-id', type=str, default='gw-merchant-id')
    parser.add_argument('--amount', type=int, default=10000)
    parser.add_argument('--mode', type=str, choices=(MODE_MASTERCARD, MODE_PAN), required=True)
    parser.add_argument('--expiration-year', type=int, help='meaningful only for pan-only', default=2030)
    parser.add_argument('--expiration-month', type=int, help='meaningful only for pan-only', default=12)
    parser.add_argument('--debug', default=False, action='store_true')

    args = parser.parse_args()

    if args.debug:
        debug_requests_on()

    generate_keys(
        args.mode,
        pan=args.pan,
        tsp_card_id=args.tsp_card_id,
        recipient_pub_key=args.recipient_pub_key,
        recipient_id=args.recipient_id,
        ntokens=args.ntokens,
        gateway_merchant_id=args.gateway_merchant_id,
        amount=args.amount,
        expiration_year=args.expiration_year,
        expiration_month=args.expiration_month,
    )


def generate_keys(
    mode: str,
    pan: str,
    tsp_card_id: str,
    recipient_pub_key: str,
    recipient_id: str,
    ntokens: int,
    gateway_merchant_id: str,
    amount: int,
    expiration_month: int,
    expiration_year: int,
) -> None:
    with tempfile.NamedTemporaryFile(mode='w') as f:
        f.write(
            '\n'.join([
                '-----BEGIN PUBLIC KEY-----',
                recipient_pub_key,
                '-----END PUBLIC KEY-----',
            ])
        )
        f.flush()
        try:
            subprocess.run(
                [
                    'ya', 'make', './cmd/sign-recipient-key/',
                ],
                check=True,
            )
            result = subprocess.run(
                [
                    './cmd/sign-recipient-key/sign-recipient-key',
                    '-recipient-public-key', f.name,
                    '-signing-key', './configs/recipient-verification-priv-key.pem'
                ],
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            print(f.name)
            print('STDOUT>>', e.stdout)
            print('STDERR>>', e.stderr)
            raise e
        signature = result.stdout


    for i in range(ntokens):
        inum = str(i).rjust(max(3, len(str(ntokens - 1))), '0')
        print(f'inum={inum}', file=sys.stderr)
        now = datetime.datetime.now()
        message_expiration = int((now + datetime.timedelta(days=365)).timestamp() * 1000)
        message_id = f"0:{recipient_id}-{now.date().isoformat()}-{inum}-{message_expiration}"
        if mode == MODE_PAN:
            r = call_pan_checkout(
                pan=pan, 
                recipient_pub_key=recipient_pub_key,
                recipient_id=recipient_id,
                signature=signature,
                message_id=message_id,
                message_expiration=message_expiration,
                gateway_merchant_id=gateway_merchant_id,
                amount=amount,
                expiration_year=expiration_year,
                expiration_month=expiration_month,
            )
        elif mode == MODE_MASTERCARD:
            r = call_mastercard_checkout(
                tsp_card_id=tsp_card_id, 
                recipient_pub_key=recipient_pub_key,
                recipient_id=recipient_id,
                signature=signature,
                message_id=message_id,
                message_expiration=message_expiration,
                gateway_merchant_id=gateway_merchant_id,
                amount=amount,
            )
        else:
            raise ValueError(f'Unknown mode: {mode}')
        try:
            assert r.status_code < 300
        except AssertionError:
            print('ERROR', file=sys.stderr)
            import time
            time.sleep(1)
            continue
        data = r.json()
        print(data['data']['payment_token'])


def call_mastercard_checkout(
    tsp_card_id: str,
    recipient_pub_key: str,
    recipient_id: str,
    signature: str,
    message_id: str,
    message_expiration: int,
    gateway_merchant_id: str,
    amount: int,
):
    return requests.post(
        url='http://localhost:1867/v1/mastercard/checkout',
        json={
            "recipient_pub_key": recipient_pub_key,
            "recipient_pub_key_signature": signature,
            "recipient_id": recipient_id,
            "card_id": tsp_card_id,
            "message_expiration": message_expiration,
            "message_id": message_id,
            "gateway_merchant_id": gateway_merchant_id,
            "transaction_info": {
                "currency": "RUB",
                "amount": amount,
            }
        },
        headers={
            'Authorization': f'SharedKey {EXTERNAL_SHARED_KEY}',
        },
    )


def call_pan_checkout(
    pan: str,
    recipient_pub_key: str,
    recipient_id: str,
    signature: str,
    message_id: str,
    message_expiration: int,
    gateway_merchant_id: str,
    amount: int,
    expiration_year: int,
    expiration_month: int,
):
    return requests.post(
        url='http://localhost:2020/v1/pan/checkout',
        json={
            "recipient_pub_key": recipient_pub_key,
            "recipient_pub_key_signature": signature,
            "recipient_id": recipient_id,
            "card": {
                "primary_account_number": pan,
                "pan_expiration_year": expiration_year,
                "pan_expiration_month": expiration_month,
            },
            "message_expiration": message_expiration,
            "message_id": message_id,
            "gateway_merchant_id": gateway_merchant_id,
            "transaction_info": {
                "currency": "RUB",
                "amount": amount,
            },
            "mit_info": {
                "recurring": True,
                "deferred": True,
            },
        },
        headers={
            'Authorization': f'SharedKey {INTERNAL_SHARED_KEY}',
        },
    )


def debug_requests_on():
    '''Switches on logging of the requests module.'''
    HTTPConnection.debuglevel = 1

    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True


main()
