from common import AlertFactory, Cluster


def build_postgres_alerts(cluster: Cluster, app_name: str, cid: str):
    factory = AlertFactory(
        app=f'{cluster.value}_{app_name}_postgres',
        alert_tags={
            'itype': ['mailpostgresql'],
            'ctype': [cid],
        },
        juggler_tags=[],
        cluster_type=cluster,
        metagroup='CON',
    )

    alerts = [
        factory.get(
            signal='push-postgres-replication_lag_tmmx',
            thresholds=(5, 15),
            name='replication lag',
        ),
        factory.get(
            signal='sum(postgresql_log-log_errors_mmmm, postgresql_log-log_fatals_mmmm)',
            thresholds=(20, 25),
            name='log errors',
        ),
        factory.get(
            signal='push-pooler-avg_query_time_vmmv',
            thresholds=(100, 200),
            name='avg query time',
        ),
        factory.get(
            signal='perc(push-disk-used_bytes_pgdata_tmmx, push-disk-total_bytes_pgdata_tmmx)',
            thresholds=(75, 90),
            name='disk usage',
            extra_tags=dict(tier=['primary']),
        ),
        factory.get(
            signal='push-disk-path-size_pg_wal_bytes_tmmx',
            thresholds=(3 << 30, 4 << 30),  # (3Gb, 4Gb)
            name='WAL size',
            extra_tags=dict(tier=['primary']),
        ),
        factory.get(
            signal='quant(portoinst-cpu_limit_usage_perc_hgram, max)',
            thresholds=(70, 85),
            name='cpu usage',
            extra_tags=dict(itype=['mdbdom0']),
            flaps={
                'boost': 0,
                'critical': 150,
                'stable': 30,
            },
        ),
    ]

    return alerts
