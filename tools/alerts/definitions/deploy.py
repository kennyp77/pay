from common import AlertFactory, Cluster


def build_deploy_alerts(cluster: Cluster, app_name: str, stage: str):
    factory = AlertFactory(
        app=f'{cluster.value}_{app_name}',
        alert_tags={
            'itype': ['deploy'],
            'stage': [stage],
            'deploy_unit': ['api'],
        },
        juggler_tags=[],
        cluster_type=cluster,
    )

    usage_alerts = [
        {
            'signal': 'quant(portoinst-cpu_limit_usage_perc_hgram, med)',
            'warn': 70,
            'crit': 80,
            'name': 'cpu usage med'
        },
        {
            'signal': 'quant(portoinst-cpu_limit_usage_perc_hgram, max)',
            'warn': 85,
            'crit': 90,
            'name': 'cpu usage max'
        },
        {
            'signal': 'quant(portoinst-anon_limit_usage_perc_hgram, max)',
            'warn': 85,
            'crit': 95,
            'name': 'memory usage'
        },
        {
            'signal': 'portoinst-net_rx_drops_summ',
            'warn': 10,
            'crit': 20,
            'name': 'inbound drops'
        },
        {
            'signal': 'portoinst-net_drops_summ',
            'warn': 10,
            'crit': 20,
            'name': 'outbound drops'
        },
        {
            'signal': 'modules-unistat-fetch_errors_mmmm',
            'warn': 20,
            'crit': 25,
            'name': 'yasm unistat fetch errors'
        },
        {
            'signal': 'modules-unistat-filtered_signals_mmmm',
            'warn': 0.5,
            'crit': 0.75,
            'name': 'yasm filtered signals'
        },
    ]

    alerts = []

    for geo in ['sas', 'vla']:
        factory.alert_tags['geo'] = [geo]
        for el in usage_alerts:
            alerts.append(factory.get(
                signal=el['signal'],
                thresholds=(el['warn'], el['crit']),
                name=el['name'],
            ))

    return alerts
