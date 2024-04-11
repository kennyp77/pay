#!/usr/bin/env python3
import argparse
import json
from base64 import b64decode
from pathlib import Path
from pprint import pprint

from cryptography.hazmat.primitives.asymmetric.ec import EllipticCurvePublicKey, ECDH  # https://cryptography.io/
from cryptography.hazmat.primitives.ciphers import base, modes, algorithms
from cryptography.hazmat.primitives.hashes import SHA256
from cryptography.hazmat.primitives.hmac import HMAC
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.serialization import load_der_private_key


PRIVATE_KEY_PATH = './encryption_key.pem'


parser = argparse.ArgumentParser(
    prog='duckgo-decrypt-token',
    formatter_class=argparse.ArgumentDefaultsHelpFormatter,
)
parser.add_argument('--token', type=str)
############  0. Obtain the encrypted payment token  ############
# take 'data.payment_token' from `POST /api/v1/checkout` response body
args = parser.parse_args()

token = args.token


############  1. Read the private encryption key  ############
private_key = Path(PRIVATE_KEY_PATH).read_bytes()
# remove header and footer lines
private_key = b'\n'.join(private_key.splitlines()[1:-1])
# can read both PEM and DER formatted keys
private_key = load_der_private_key(b64decode(private_key), None)


############  2. Decode Yandex Pay payment method token payload  ############
token_json = json.loads(b64decode(token))
message = json.loads(token_json['signedMessage'])
encrypted_message = b64decode(message['encryptedMessage'])
ephemeral_public_key = b64decode(message['ephemeralPublicKey'])


############  3. Derive the shared encryption key  ############
encryption_public_key = EllipticCurvePublicKey.from_encoded_point(
    curve=private_key.curve,
    data=ephemeral_public_key,
)
shared_secret = private_key.exchange(ECDH(), encryption_public_key)
hkdf = HKDF(algorithm=SHA256(), length=64, salt=None, info=b'Yandex')
hkdf_bytes = hkdf.derive(ephemeral_public_key + shared_secret)
symmetric_encryption_key = hkdf_bytes[:32]
mac_key = hkdf_bytes[32:]


############  4. Verify the message tag  ############
hmac = HMAC(mac_key, SHA256())
hmac.update(encrypted_message)
hmac.verify(b64decode(message['tag']))


############  5. Decrypt the message  ############
# counter = Counter.new(128, initial_value=0)
# cipher = AES.new(symmetric_encryption_key, AES.MODE_CTR, counter=counter)
cipher = base.Cipher(algorithms.AES(symmetric_encryption_key), modes.CTR(b'\x00' * 16))
decryptor = cipher.decryptor()
decrypted_message = decryptor.update(encrypted_message) + decryptor.finalize()
pprint(json.loads(decrypted_message))
