from sendr_qstats import AggSuff, Counter, Histogram, IntSuff, MetricsRegistry, MetricSuffix

from pay.bill_payments.bill_payments.conf import settings

REGISTRY = MetricsRegistry(ctype=settings.get('STATS_CTYPE'))

ABS_MAX_SUFF = MetricSuffix(
    IntSuff.absolute.value,
    AggSuff.max.value,
    AggSuff.max.value,
    AggSuff.trnsp.value,
)

interaction_response_time = Histogram(
    'response_time',
    buckets=settings.STATS_RESPONSE_TIME_BUCKETS,
    labelnames=('service',),
    registry=REGISTRY,
)
interaction_response_status = Counter(
    'response_status',
    labelnames=('service', 'status'),
    registry=REGISTRY,
)

interaction_method_response_time = Histogram(
    'response_method_time',
    buckets=settings.STATS_RESPONSE_TIME_BUCKETS,
    labelnames=('service', 'method'),
    registry=REGISTRY,
)
interaction_method_response_status = Counter(
    'response_method_status',
    labelnames=('service', 'method', 'status'),
    registry=REGISTRY,
)
transaction_status = Counter(
    'transaction_status',
    labelnames=('status',),
    registry=REGISTRY,
)

bill_notification_failures = Counter(
    'bill_notification_failures',
    registry=REGISTRY,
)
