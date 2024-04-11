from common import AlertFactory, Cluster


def build_workers_alerts(cluster: Cluster):
    factory = AlertFactory(
        app=f'{cluster.value}_workers',
        alert_tags={
            'itype': ['deploy'],
            'stage': [f'yandexpay-{cluster.value}'],
            'deploy_unit': ['workers'],
        },
        juggler_tags=[],
        cluster_type=cluster,
    )

    alerts = [
        factory.get(
            signal='portoinst-capacity-perc_usage_/virtual_disks/infra_txxx',
            thresholds=(80, 90),
            name='disk usage',
        ),
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
        factory.get(
            signal='unistat-psp_key_age_days_axxx',
            thresholds=(365, 365 + 30),
            name='PSP public key age',
        ),
        factory.get(
            signal='unistat-pay_plus_create_order_failures_summ',
            thresholds=(2, 3),
            name='pay plus create order failures',
        ),
        factory.get(
            signal='unistat-pay_plus_update_order_failures_summ',
            thresholds=(2, 3),
            name='pay plus update order failures',
        ),
        factory.get(
            signal='unistat-merchant_order_update_failures_summ',
            thresholds=(2, 3),
            name='merchant update order failures',
        ),
    ]

    for action in [
        'mark_enrollment_as_deleted',
        ('plus_backend_create_order', 25, 50),
        ('plus_backend_update_order_status', 25, 50),
        'update_enrollment',
        'update_enrollment_metadata',
        'update_mastercard_card_image',
        ('update_merchant_order', 15, 30),
        'update_visa_card_image',
        'visa_update_card_metadata_notification',
    ]:
        if isinstance(action, str):
            action = (action, 3000, 4000)
        action_name, left, right = action

        alerts.append(factory.get(
            signal=f'unistat-worker_tasks_queue_size_{action_name}_axxx',
            thresholds=(left, right),
            name=f'{action_name} queue size',
        ))

    return alerts
