from common import AlertFactory, Cluster


def build_fim_alerts(cluster: Cluster):
    factory = AlertFactory(
        app=f'{cluster.value}_frontback',
        alert_tags={
            'itype': ['deploy'],
            'stage': [f'yandexpay-front-{cluster.value}'],
            'deploy_unit': ['front'],
        },
        juggler_tags=[],
        cluster_type=cluster,
    )
    failed_check = factory.get(
        signal='unistat-fim_check_failed_summ',
        thresholds=(None, 1),
        name='fim checks failed',
    )
    # sum up all signal values over the last 120 seconds
    failed_check.update(value_modify={'window': 120, 'type': 'summ'})
    return [failed_check]
