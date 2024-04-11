from common import AlertDocLink, AlertFactory, Cluster


def order_status_metrics():
    # данный код нужен, так как
    # 1. juggler не умеет распознавать wildcard в проверке
    # 2. juggler не умеет распознавать два паттерна в проверке
    order_statuses = ['new', 'success', 'hold', 'reverse', 'refund', 'chargeback', 'fail']
    order_statuses_pattern = '|'.join(order_statuses)
    metrics = []
    for status in order_statuses:
        metrics.append(f'unistat-order_update_unexpected_status_<{order_statuses_pattern}>_{status}_summ')
    return f'sum({",".join(metrics)})'


def build_plus_alerts(cluster: Cluster):
    factory = AlertFactory(
        app=f'{cluster.value}_plus',
        alert_tags={
            'itype': ['deploy'],
            'stage': [f'yandexpay-plus-{cluster.value}'],
            'deploy_unit': ['api', 'api-public', 'workers'],
        },
        juggler_tags=[],
        cluster_type=cluster,
    )

    factory.alert_tags['geo'] = ['sas', 'vla']

    alerts = []
    if cluster == Cluster.PRODUCTION:
        alerts = [
            factory.get(
                signal=order_status_metrics(),
                thresholds=(None, 1),
                name='unexpected order status',
                doc_links=[
                    AlertDocLink(
                        title='⚠Что делать, если алерт сработал',
                        url='https://wiki.yandex-team.ru/finsrv/swat/yandexpay/'
                            '#alert-doc-order-update-unexpected-status',
                        type='wiki',
                    )
                ],
            ),
            factory.get(
                signal='sum(unistat-order_update_events_skipped_summ)',
                thresholds=(2, 3),
                name='order update events skipped',
                doc_links=[
                    AlertDocLink(
                        title='⚠Что делать, если алерт сработал',
                        url='https://wiki.yandex-team.ru/finsrv/swat/yandexpay/#alert-doc-order-update-events-skipped',
                        type='wiki',
                    )
                ],
                flaps={'boost': 0, 'critical': 20, 'stable': 30}
            ),
            factory.get(
                signal='sum(unistat-user_score_not_found_summ)',
                thresholds=(5, 10),
                name='saturn user score not found',
                doc_links=[
                    AlertDocLink(
                        title='⚠Что делать, если алерт сработал',
                        url='https://wiki.yandex-team.ru/finsrv/swat/yandexpay/#alert-doc-user-score-not-found',
                        type='wiki',
                    )
                ],
            ),
            factory.get(
                signal='sum(unistat-merchant_order_update_failures_summ)',
                thresholds=(1, 3),
                name='merchant update order failures',
            ),
        ]

    return alerts
