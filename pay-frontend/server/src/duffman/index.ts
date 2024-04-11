import { paths } from '../utils';

const oldRoutes = [
    {
        name: '/sdk/v1/init',
        path: paths.resolveRoute('sdk-init'),
    },
    {
        name: '/sdk/v1/ready-check',
        path: paths.resolveRoute('sdk-ready-check'),
    },
    {
        name: '/sdk/v1/init-speedup',
        path: paths.resolveRoute('sdk-init-speedup'),
    },
    {
        name: '/sdk/v1/payment-method',
        path: paths.resolveRoute('sdk-payment-method'),
    },
    {
        name: '/form',
        path: paths.resolveRoute('pay-form'),
    },
    {
        name: '/checkout-mock',
        path: paths.resolveRoute('checkout-mock'),
    },
    {
        name: '/checkout',
        path: paths.resolveRoute('checkout'),
    },
    {
        name: '/console',
        path: paths.resolveRoute('console'),
    },
    {
        name: '/console-registration',
        path: paths.resolveRoute('console-registration'),
    },
    /* https://st.yandex-team.ru/YANDEXPAY-1704: пока просто убрали роут
    {
        name: '/track',
        path: paths.resolveRoute('track-user'),
    },
    */
    {
        name: '/web-api/mobile/v1/user_info',
        path: paths.resolveRoute('web-api-mobile/user-info'),
    },
    {
        name: '/web-api/v1/find-house-nearby',
        path: paths.resolveRoute('geocoder-find-house-nearby'),
    },
    {
        name: '/web-api/v1/check',
        path: paths.resolveRoute('check-csp'),
    },
    {
        name: '/web-api/v1/decrease-session',
        path: paths.resolveRoute('decrease-session'),
    },
];

const oldWebAPIRoutes = [
    {
        name: '/web/web-api/mobile/v1/user_info',
        path: paths.resolveRoute('web-api-mobile/user-info'),
    },
    {
        name: '/web/web-api/v1/find-house-nearby',
        path: paths.resolveRoute('geocoder-find-house-nearby'),
    },
    {
        name: '/web/web-api/v1/check',
        path: paths.resolveRoute('check-csp'),
    },
    {
        name: '/web/web-api/v1/decrease-session',
        path: paths.resolveRoute('decrease-session'),
    },
];

const routes = [
    {
        name: '/web/sdk/v1/init',
        path: paths.resolveRoute('sdk-init'),
    },
    {
        name: '/web/sdk/v1/init-speedup',
        path: paths.resolveRoute('sdk-init-speedup'),
    },
    {
        name: '/web/sdk/v1/ready-check',
        path: paths.resolveRoute('sdk-ready-check'),
    },
    {
        name: '/web/sdk/v1/payment-method',
        path: paths.resolveRoute('sdk-payment-method'),
    },
    {
        name: '/web/form',
        path: paths.resolveRoute('pay-form'),
    },
    {
        name: '/web/checkout-mock',
        path: paths.resolveRoute('checkout-mock'),
    },
    {
        name: '/web/checkout',
        path: paths.resolveRoute('checkout'),
    },
    {
        name: '/web/console',
        path: paths.resolveRoute('console'),
    },
    {
        name: '/web/console-registration',
        path: paths.resolveRoute('console-registration'),
    },

    {
        name: '/web/playground',
        path: paths.resolveRoute('playground/main'),
    },
    /* https://st.yandex-team.ru/YANDEXPAY-1704: пока просто убрали роут
    {
        name: '/web/track',
        path: paths.resolveRoute('track-user'),
    },
    */
    {
        name: '/web/api/mobile/v1/user_info',
        path: paths.resolveRoute('web-api-mobile/user-info'),
    },
    {
        name: '/web/api/v1/find-house-nearby',
        path: paths.resolveRoute('geocoder-find-house-nearby'),
    },
    {
        name: '/web/api/v1/check',
        path: paths.resolveRoute('check-csp'),
    },
    {
        name: '/web/api/v1/decrease-session',
        path: paths.resolveRoute('decrease-session'),
    },
    {
        name: '/web/api/playground/v1/order/render',
        path: paths.resolveRoute('playground/api/order-render'),
    },
    {
        name: '/web/api/playground/v1/order/create',
        path: paths.resolveRoute('playground/api/order-create'),
    },
    {
        name: '/web/api/playground/v1/pickup-options',
        path: paths.resolveRoute('playground/api/pickup-options'),
    },
    {
        name: '/web/api/playground/v1/pickup-option-details',
        path: paths.resolveRoute('playground/api/pickup-option-details'),
    },
];

module.exports = {
    global: true,
    routes: [...routes, ...oldWebAPIRoutes, ...oldRoutes],
};
