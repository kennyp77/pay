from common import AlertFactory


def build_balancer_alerts(cluster_type, prj, upstream_list):
    factory = AlertFactory(
        app=f'{prj}_{upstream_list[0]}',
        alert_tags={
            'itype': ['balancer'],
            'ctype': ['prod'],
            'prj': [prj],
            'geo': ['sas', 'vla'],
        },
        juggler_tags=[],
        cluster_type=cluster_type,
    )

    assert isinstance(upstream_list, list)
    upstreams = '|'.join(upstream_list)
    default_flaps = {
        'boost': 0,
        'critical': 150,
        'stable': 30,
    }
    alerts = [
        factory.get(
            signal=f'or(quant(hmerge(balancer_report-report-<{upstreams}>-processing_time_hgram), 95), 0)',
            thresholds=(3, 7),
            name='time p95',
            flaps=default_flaps,
        ),
        factory.get(
            signal=f'sum(balancer_report-report-<{upstreams}>-outgoing_5xx_summ)',
            thresholds=(3, 10),
            name='balancer 5xx',
            flaps=default_flaps,
        ),
        factory.get(
            signal=f"""perc(
                sum(balancer_report-report-<{upstreams}>-outgoing_4xx_summ),
                max(sum(balancer_report-report-<{upstreams}>-requests_summ), 100)
            )""",
            thresholds=(17, 25),
            name='balancer 4xx',
            flaps=default_flaps,
        ),
        factory.get(
            signal=f'sum(balancer_report-report-<{upstreams}>-backend_timeout_summ)',
            thresholds=(3, 10),
            name='balancer timeout error',
            flaps=default_flaps,
        ),
        factory.get(
            signal=f'sum(balancer_report-report-<{upstreams}>-backend_error_summ)',
            thresholds=(3, 10),
            name='balancer backend error',
            flaps=default_flaps,
        ),
        factory.get(
            signal='balancer_report-ssl_error-tls_process_client_certificate_certificate_verify_failed_summ',
            thresholds=(None, 1),
            name='client certificate verify failed',
        ),
        factory.get(
            signal=f"""perc(
                sum(balancer_report-report-<{upstreams}>-outgoing_5xx_summ),
                max(sum(balancer_report-report-<{upstreams}>-requests_summ), 1000)
            )""",
            thresholds=(0.9, 1),
            name='balancer 5xx perc',
            disaster=True,
            flaps=default_flaps,
        ),
    ]

    return alerts
