import argparse
import json
import sys

from common import ALERTS_KEY, AmbryClient, Cluster
from definitions.api import build_api_alerts
from definitions.balancer import build_balancer_alerts
from definitions.deploy import build_deploy_alerts
from definitions.fim import build_fim_alerts
from definitions.plus import build_plus_alerts
from definitions.postgres import build_postgres_alerts
from definitions.promo import build_promo_alerts
from definitions.workers import build_workers_alerts


def get_args():
    parser = argparse.ArgumentParser(description='upload Yandex Pay alerts')
    parser.add_argument(
        '--dry',
        action='store_true',
        default=False,
        help='dry run',
    )
    parser.add_argument(
        '--interval',
        metavar='<seconds>',
        type=float,
        default=5.0,
        help='time interval between operation status checks (default=10.0)',
    )
    parser.add_argument(
        '--total-time',
        metavar='<seconds>',
        type=float,
        default=600.0,
        help='maximum waiting time for background upload operation completion',
    )
    return parser.parse_args()


def _pay_alerts():
    return (
        build_api_alerts(Cluster.PRODUCTION)
        + build_api_alerts(Cluster.SANDBOX)
        + build_api_alerts(Cluster.TESTING)

        + build_deploy_alerts(Cluster.PRODUCTION, 'api', 'yandexpay-production')
        + build_deploy_alerts(Cluster.SANDBOX, 'api', 'yandexpay-sandbox')
        + build_deploy_alerts(Cluster.TESTING, 'api', 'yandexpay-testing')

        + build_postgres_alerts(Cluster.PRODUCTION, 'api', 'mdbu171pnka1iije534a')
        + build_postgres_alerts(Cluster.SANDBOX, 'api', 'mdbgh255h9bpcgqr9nb5')
        + build_postgres_alerts(Cluster.TESTING, 'api', 'mdbdssrl8lrsfi14vqpm')

        + build_workers_alerts(Cluster.TESTING)
        + build_workers_alerts(Cluster.PRODUCTION)

        + build_balancer_alerts(Cluster.PRODUCTION, 'pay.yandex.ru', ['api', 'api_is_ready_to_pay', 'checkout-api'])
        + build_balancer_alerts(Cluster.PRODUCTION, 'pay.yandex.net', ['api-internal'])
        # + build_balancer_alerts(Cluster.PRODUCTION, 'mastercard.pay.yandex.net', ['events_rewrite'])
        + build_balancer_alerts(Cluster.PRODUCTION, 'pay.yandex.ru', ['front'])
        + build_balancer_alerts(Cluster.SANDBOX, 'sandbox.pay.yandex.ru', ['api', 'api_is_ready_to_pay', 'plus-api'])
        + build_balancer_alerts(Cluster.SANDBOX, 'sandbox.pay.yandex.ru', ['front'])
    )


def _plus_alerts():
    return (
        build_plus_alerts(Cluster.PRODUCTION)

        + build_deploy_alerts(Cluster.PRODUCTION, 'plus', 'yandexpay-plus-production')
        + build_deploy_alerts(Cluster.TESTING, 'plus', 'yandexpay-plus-testing')

        + build_postgres_alerts(Cluster.PRODUCTION, 'plus', 'mdb8lhg90g0v7hi061eg')
        + build_postgres_alerts(Cluster.TESTING, 'plus', 'mdbau0ceen9aonele1r0')
    )


def _bill_payments_alerts():
    return (
        build_deploy_alerts(Cluster.PRODUCTION, 'bills', 'bill-payments-production')
        + build_deploy_alerts(Cluster.TESTING, 'bills', 'bill-payments-testing')

        + build_postgres_alerts(Cluster.PRODUCTION, 'bills', 'mdbrkb2o01emvu2vhrm3')
        + build_postgres_alerts(Cluster.TESTING, 'bills', 'mdbe8bgkep001elakgag')

        + build_balancer_alerts(Cluster.PRODUCTION, 'bills.pay.yandex.ru', ['api'])
        + build_balancer_alerts(Cluster.PRODUCTION, 'bills.pay.yandex.net', ['webhooks'])
    )


def main():
    args = get_args()

    alerts = {
        'prefix': ALERTS_KEY,
        'alerts': (
            _pay_alerts()
            + _plus_alerts()
            + _bill_payments_alerts()
            + build_promo_alerts()
            + build_fim_alerts(Cluster.TESTING)
        ),
    }

    if args.dry:
        print(json.dumps(alerts, indent=4, ensure_ascii=False))
        return 0

    ambry = AmbryClient()
    success = ambry.replace_alerts(alerts, args.total_time, args.interval)
    return 0 if success else 1


if __name__ == '__main__':
    code = main()
    sys.exit(code)
