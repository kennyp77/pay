import { Buffer } from 'buffer';

// import axios from 'axios';
// import { importJWK, jwtVerify } from 'jose';
// import _ from 'lodash';
//
// const JWK_URL = 'https://test.pay.yandex.ru/api/jwks';
//
// const getJwkKeys = _.memoize(
//     () => axios.get(JWK_URL),
//     () => {
//         getJwkKeys.cache.clear();
//
//         const [date, time] = new Date().toISOString().split('T');
//         const [hour] = time.split(':');
//
//         return `${date}T${hour}`;
//     },
// );
//
// export async function jwtPayload<T>(rawPayload: string | Buffer): Promise<T> {
//     const jwtPayload = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf-8') : rawPayload;
//
//     const jwkKeysRes = await getJwkKeys();
//     const jwkKeys = jwkKeysRes.data;
//
//     const ecPublicKey = await importJWK(jwkKeys.keys[0], 'ES256');
//     const { payload } = await jwtVerify(jwtPayload, ecPublicKey);
//
//     return payload as unknown as T;
// }

export async function jwtPayload<T>(rawPayload: string | Buffer): Promise<T> {
    const jwtPayload = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf-8') : rawPayload;

    const { 1: encPayload, length } = jwtPayload.split('.');

    if (length !== 3) {
        throw new Error('Invalid JWT payload');
    }

    const payload = JSON.parse(Buffer.from(encPayload, 'base64').toString('utf-8'));

    return payload as unknown as T;
}
