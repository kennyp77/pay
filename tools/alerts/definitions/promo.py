from common import AlertFactory, Cluster


def build_promo_alerts():
    factory = AlertFactory(
        app='pay.yandex.ru_promo',
        alert_tags={
            'itype': ['balancer'],
            'ctype': ['prod'],
            'prj': ['pay.yandex.ru'],
            'geo': ['sas', 'vla'],
        },
        juggler_tags=[],
        cluster_type=Cluster.PRODUCTION,
    )

    alerts = [
        factory.get(
            signal='sum(balancer_report-report-<promo>-outgoing_5xx_summ)',
            thresholds=(2, 5),
            name='balancer 5xx',
        ),
    ]

    return alerts
