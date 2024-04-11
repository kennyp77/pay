import * as Sdk from '@yandex-pay/sdk/src/typings';

export const MERCHANTS: Record<string, Sdk.Merchant> = {
    'https://test.pay.yandex.ru': {
        id: '1003b7ce-f225-4675-bf4e-e49c3ac5747c',
        name: 'test-merchant',
    },
};

if (__DEV__) {
    MERCHANTS['https://pay.local.yandex.ru:3010'] = {
        id: 'c1069d7a-0e0d-4251-9ba0-aa763a13b4f9',
        name: 'local-merchant',
        url: 'tele2.ru',
    };
}
