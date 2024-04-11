import slice from '@tinkoff/utils/array/slice';

// TODO: Придумать что-нить поумнее для i18n
export function formatDayMonth(date: Date, monthVariant: 'short' | 'long' = 'long') {
    const formatter = new Intl.DateTimeFormat('ru', {
        day: 'numeric',
        month: monthVariant,
    });

    let text = formatter.format(date);

    if (monthVariant === 'short') {
        const parts = text.split(' ').filter(Boolean);

        parts[1] = slice(0, 3, parts[1] || '');
        text = parts.join(' ');
    }

    return text;
}

type PlanPayments = Array<{
    status: 'expected' | 'coming' | 'paid' | 'failed' | 'canceled';
    timestamp: number;
    date: string;
    amount: string;
    weight: number;
    isNext: boolean;
}>;

export function getRenderPayments(plan: Checkout.SplitPlan): PlanPayments {
    const total = Number(plan.sum);

    const payments: PlanPayments = plan.payments.map((payment) => ({
        status: payment.status,
        amount: payment.amount,
        timestamp: payment.datetime.getTime(),
        date: formatDayMonth(payment.datetime, 'short'),
        weight: Math.floor((Number(payment.amount) / total) * 100),
        isNext: false,
    }));

    payments.sort((a, b) => a.timestamp - b.timestamp);

    // NB: После перевода на новое API Сплита, оставить только поиск 'expected' статуса
    const nextPayment =
        payments.find((payment) => payment.status === 'expected') ||
        payments.find((payment) => payment.status === 'coming');

    if (nextPayment) {
        nextPayment.isNext = true;
    }

    return payments;
}
