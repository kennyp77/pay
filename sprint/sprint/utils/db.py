from sendr_aiopg.engine.lazy import LazyEngine, create_engine

from pay.sprint.sprint.conf import settings


def get_host_configuration():
    return {
        'database': settings.DATABASE['NAME'],
        'user': settings.DATABASE['USER'],
        'password': settings.DATABASE['PASSWORD'],
        'port': settings.DATABASE['PORT'],
        'sslmode': 'require' if settings.DATABASE.get('USE_SSL') else 'disable',
        'connect_timeout': settings.DB_CONNECT_TIMEOUT,
        'timeout': settings.DB_TIMEOUT,
        'maxsize': settings.DATABASE.get('MAXSIZE', 10),
        'minsize': settings.DATABASE.get('MINSIZE', 1),
        'tcp_user_timeout': settings.DATABASE.get('TCP_USER_TIMEOUT', 500),
    }


def get_db_configuration():
    return {
        **get_host_configuration(),
        'host': settings.DATABASE['HOST'],
    }


def create_configured_engine() -> LazyEngine:  # pragma: no cover
    return create_engine(
        pg_pinger_url=settings.PG_PINGER_URL,
        **get_host_configuration(),
    )
