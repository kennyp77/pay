import { createGetter } from '@trust/utils/object';
import * as Sdk from '@yandex-pay/sdk/src/typings';

const configGetter = createGetter(window.__CONFIG);

export const ENV = configGetter('env', 'testing');
export const UID = configGetter('uid', '');
export const CSRF_TOKEN = configGetter('csrfToken', '');
export const DEV_USERNAME = configGetter('devUsername', '');

/**
 * Конфиги для тестинга
 */
export const MERCHANTS: Record<string, Sdk.Merchant[]> = {
    'https://test.pay.yandex.ru': [
        {
            id: '1003b7ce-f225-4675-bf4e-e49c3ac5747c',
            name: 'testing-merchant',
            url: 'https://test.pay.yandex.ru',
        },
        {
            id: 'a751322c-bd3b-4133-b823-ed460f6440fb',
            name: 'testing-brandshop',
            url: 'https://test.pay.yandex.ru',
        },
        {
            id: 'a8f1c405-675c-48a5-a4a4-a20920ca28ad',
            name: 'testing-passport-bills',
            url: 'https://test.pay.yandex.ru',
        },
        {
            id: '7bdd561e-f949-4d42-b2cd-72ab46687113',
            name: 'testing-tinkoff',
            url: 'https://test.pay.yandex.ru',
        },
        {
            id: 'a751322c-bd3b-4133-b823-ed460f6440fb',
            name: 'testing-split',
            url: 'https://test.pay.yandex.ru',
        },
    ],
};

export const BOLT_MERCHANTS: Record<string, Sdk.Merchant[]> = {
    'https://test.pay.yandex.ru': [
        {
            id: 'ec6e91b2-efbc-4894-9422-a2bf73e8714a',
            name: 'testing-bolt-merchant',
            url: 'https://test.pay.yandex.ru',
        },
    ],
};

/**
 * Конфиги для локальной разработки
 */

if (__DEV__) {
    MERCHANTS['https://pay.local.yandex.ru:3010'] = [
        {
            id: 'c1069d7a-0e0d-4251-9ba0-aa763a13b4f9',
            name: 'local-merchant',
            url: '',
        },
        {
            id: '7b1694c8-fc12-45dd-9b76-7b846c29d195',
            name: 'local-brandshop',
            url: '',
        },
        {
            id: '6efc52fd-f380-4faf-b5df-c6c61e762d0c',
            name: 'local-passport-bills',
            url: '',
        },
        {
            id: 'b158a78a-ca73-4dda-867c-b826d86c4a74',
            name: 'local-tinkoff',
            url: '',
        },
        {
            id: '7b1694c8-fc12-45dd-9b76-7b846c29d195',
            name: 'local-split',
            url: '',
        },
    ];

    /**
     * ID мерчей нужно запрашивать у бэка
     * - адрес мерча должен быть указан https://<username>-8080-ws2.tunneler-si.yandex.ru/web/api/playground/v1/order/render
     */
    BOLT_MERCHANTS['https://pay.local.yandex.ru:3010'] = [
        {
            name: 'ruslankunaev',
            id: '40ce6632-ffaf-419d-a2a2-30effd1b2e2a',
            url: 'https://ruslankunaev-8080-ws2.tunneler-si.yandex.ru',
        },
        {
            name: 'stepler',
            id: '25c1d927-6a8a-4e58-a73d-4a72c0e4ff20',
            url: 'https://stepler-8080-ws2.tunneler-si.yandex.ru',
        },
        {
            name: 'kir-9',
            id: '7bdd561e-f949-4d42-b2cd-72ab46687113',
            url: 'https://kir-9-8080-ws1.tunneler-si.yandex.ru',
        },
        {
            name: 'vovanostm',
            id: '5a936298-8149-4d73-b7e5-1ceebb11a783',
            url: 'https://vovanostm-8080-ws1.tunneler-si.yandex.ru',
        },
    ];
}
