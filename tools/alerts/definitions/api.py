import itertools

from common import AlertDocLink, AlertFactory, Cluster


def _get_status_signal(method, status):
    return f'sum(unistat-request_status_{method}_<GET|POST|PUT|PATCH|DELETE>_{status}_summ)'


tsp_notification_methods = {
    'mastercard_card_notifications': (3, 5),
    'visa_token_status_update_notification': (10, 15),
    'visa_card_metadata_update_notification': (3, 5),
}


def _add_tsp_notification_alerts(alerts, factory):
    for (method, thresholds), status in itertools.product(tsp_notification_methods.items(), ('5xx', '4xx')):
        alerts.append(factory.get(
            signal=_get_status_signal(method, status),
            thresholds=thresholds,
            name=f'method {method} {status}',
        ))


def _add_mobile_prefix(strings):
    return strings + [f'mobile_{string}' for string in strings]


def build_api_alerts(cluster: Cluster):
    factory = AlertFactory(
        app=f'{cluster.value}_api',
        alert_tags={
            'itype': ['deploy'],
            'stage': [f'yandexpay-{cluster.value}'],
            'deploy_unit': ['api'],
        },
        juggler_tags=[],
        cluster_type=cluster,
    )

    factory.alert_tags['geo'] = ['sas', 'vla']

    alerts = [
        factory.get(
            signal='unistat-unknown_trust_payment_system_summ',
            thresholds=(3, 10),
            name='unknown trust payment systems',
            doc_links=[
                AlertDocLink(
                    title='⚠Что делать, если алерт сработал',
                    url='https://wiki.yandex-team.ru/finsrv/swat/yandexpay/#alert-doc-unknown-trust-payment-systems',
                    type='wiki',
                )
            ],
        ),
        factory.get(
            signal='unistat-pay_plus_create_order_failures_summ',
            thresholds=(1, 3),
            name='pay plus create order failures',
        ),
        factory.get(
            signal='unistat-pay_plus_update_order_failures_summ',
            thresholds=(1, 3),
            name='pay plus update order failures',
        ),
        factory.get(
            signal='unistat-laas_failures_summ',
            thresholds=(None, 3),
            name='laas failures',
            doc_links=[
                AlertDocLink(
                    title='⚠Что делать, если алерт сработал',
                    url='https://wiki.yandex-team.ru/finsrv/swat/yandexpay/#alert-doc-laas-failure',
                    type='wiki',
                )
            ]
        ),
        factory.get(
            signal='unistat-response_status_antifraud_5xx_summ',
            thresholds=(3, 6),
            name='antifraud 5xx',
        ),
        factory.get(
            signal='unistat-response_status_antifraud_4xx_summ',
            thresholds=(1, 3),
            name='antifraud 4xx',
        ),
        factory.get(
            signal='unistat-response_status_yandex_pay_plus_5xx_summ',
            thresholds=(4, 7),
            name='yandexpayplus 5xx',
            doc_links=[
                AlertDocLink(
                    title='⚠Что делать, если алерт сработал',
                    url='https://wiki.yandex-team.ru/finsrv/swat/yandexpay/#alert-doc-yandexpay-4xx-5xx',
                    type='wiki',
                )
            ]
        ),
        factory.get(
            signal='unistat-response_status_yandex_pay_plus_4xx_summ',
            thresholds=(4, 7),
            name='yandexpayplus 4xx',
            doc_links=[
                AlertDocLink(
                    title='⚠Что делать, если алерт сработал',
                    url='https://wiki.yandex-team.ru/finsrv/swat/yandexpay/#alert-doc-yandexpay-4xx-5xx',
                    type='wiki',
                )
            ]
        ),
        factory.get(
            signal='unistat-merchant_order_create_failures_summ',
            thresholds=(2, 3),
            name='merchant create order failures',
        ),
        factory.get(
            signal='unistat-split_checkout_failures_summ',
            thresholds=(2, 3),
            name='split checkout failures',
        ),
        factory.get(
            signal='unistat-get_contact_failures_summ',
            thresholds=(1, 3),
            name='get contact failures',
        ),
    ] if cluster == Cluster.PRODUCTION else []

    alerts.extend([
        factory.get(
            signal='unistat-hot_settings_using_failures_summ',
            thresholds=(1, 3),
            name='hot settings using failures',
        ),
        factory.get(
            signal='unistat-hot_settings_refresh_failures_summ',
            thresholds=(1, 3),
            name='hot settings refresh failures',
        ),
    ])

    generic_handlers = _add_mobile_prefix([
        'v1_get_user_cards',
        'v1_is_ready_to_pay',
        'v1_checkout',
    ])
    for method in generic_handlers:
        alerts.append(factory.get(
            signal=f'perc({_get_status_signal(method, "5xx")},max(100,{_get_status_signal(method, "<2|4|5>xx")}))',
            thresholds=(0.5, 1),
            name='method {} 5xx'.format(method),
            flaps={
                'boost': 0,
                'critical': 100,
                'stable': 20,
            },
        ))

    sensitive_handlers = _add_mobile_prefix([
        'v1_validate',
        'v1_geocode',
        'v1_address_collection',
        'v1_address',
        'v1_contact_collection',
        'v1_contact',
        'v1_split_plans',
        'v1_user_settings',
    ]) + [
        'mobile_v1_thales_encrypted_card',
        'mobile_v1_encrypted_app_id',
        'mobile_v1_register_push_token',
        'mobile_v1_beta_allowed',
        'mobile_v1_allowed_bins',
        'wallet_thales_push_notification',
    ]

    for method in sensitive_handlers:
        alerts.append(factory.get(
            signal=_get_status_signal(method, '5xx'),
            thresholds=(None, 1),
            name='method {} 5xx'.format(method),
            flaps={
                'boost': 0,
                'critical': 20,
                'stable': 5,
            },
        ))

    if cluster in (Cluster.PRODUCTION, Cluster.TESTING):
        _add_tsp_notification_alerts(alerts, factory)

    return alerts
