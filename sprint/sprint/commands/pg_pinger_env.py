import click

from pay.sprint.sprint.utils.db import get_db_configuration


@click.command()
def cli() -> None:
    db_conf = get_db_configuration()
    for variable, value in (
        ('PINGER_HOSTS', db_conf['host']),
        ('PINGER_PORT', db_conf['port']),
        ('PINGER_USERNAME', db_conf['user']),
        ('PINGER_PASSWORD', db_conf['password']),
        ('PINGER_DATABASE', db_conf['database']),
        ('PINGER_SSLMODE', db_conf['sslmode']),
    ):
        print(variable, value, sep="=")
