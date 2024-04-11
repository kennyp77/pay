import { CardIssuer } from '@trust/bank-cards/typings';
import { CardSystem } from '@trust/utils/cards';
import { PaymentMethodType, PaymentMethod } from '@trust/utils/payment-methods/typings';

type PaymentList = Array<{ id: string; issuer: string; method: PaymentMethod }>;

const getEl = <T>(list: T[], idx: number): T => {
    return list[(idx + 1) % list.length];
};

export function getPaymentList(): PaymentList {
    const systems: CardSystem[] = Object.values(CardSystem);

    // Добавляем неизвестные банки в кол-ве платежных систем
    // Чтобы увидеть все варианты отображения платежных систем
    const issuers = Object.values(CardIssuer)
        .filter((_issuer) => _issuer !== CardIssuer.Unknown)
        .concat(Array.from({ length: systems.length }, () => CardIssuer.Unknown));

    const lastDigits = ['5213', '8422', '6678', '9462', '8113'];

    return issuers.map((issuer, idx) => ({
        id: `id-${idx}`,
        issuer,
        method: {
            type: PaymentMethodType.Card,
            key: `id-${idx}`,
            disabled: false,
            id: `id-${idx}`,
            lastDigits: getEl(lastDigits, idx),
            system: getEl(systems, idx),
            issuer,
        },
    }));
}
