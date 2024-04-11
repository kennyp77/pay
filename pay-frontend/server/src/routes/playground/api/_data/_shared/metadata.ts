export interface OrderMetadata {
    currency: string;
    order: {
        value: number;
    };
    billingContact: {
        name: boolean;
        email: boolean;
        phone: boolean;
    };
    shippingContact?: {
        name: boolean;
        email: boolean;
        phone: boolean;
    };
    paymentMethods?: {
        cash: boolean;
        split: boolean;
    };
    coupons?: {
        enabled: boolean;
    };
    receipt?: {
        enabled: boolean;
    };
    shipping?: {
        enabled: boolean;
        values: number[];
    };
    pickup?: {
        enabled: boolean;
        value: string;
    };
}

const n2b = (val: undefined | number) => Boolean(val);
const b2n = (val: undefined | boolean) => (val ? 1 : 0);

export function encodeMetadata(meta: OrderMetadata): string {
    return JSON.stringify([
        meta.currency,
        meta.order.value,
        [b2n(meta.billingContact?.name), b2n(meta.billingContact?.email)],
        [
            b2n(meta.shippingContact?.name),
            b2n(meta.shippingContact?.email),
            b2n(meta.shippingContact?.phone),
        ],
        [b2n(meta.paymentMethods?.cash), b2n(meta.paymentMethods?.split)],
        b2n(meta.coupons?.enabled),
        [b2n(meta.shipping?.enabled), meta.shipping?.values],
        [b2n(meta.pickup?.enabled), meta.pickup?.value],
        b2n(meta.receipt?.enabled),
    ]);
}

export function decodeMetadata(rawMeta: string): OrderMetadata {
    try {
        const enc = JSON.parse(rawMeta);

        return {
            currency: enc[0],
            order: {
                value: enc[1],
            },
            billingContact: {
                name: n2b(enc[2][0]),
                email: n2b(enc[2][1]),
                phone: false,
            },
            shippingContact: {
                name: n2b(enc[3][0]),
                email: n2b(enc[3][1]),
                phone: n2b(enc[3][2]),
            },
            paymentMethods: {
                cash: n2b(enc[4][0]),
                split: n2b(enc[4][1]),
            },
            coupons: {
                enabled: n2b(enc[5]),
            },
            shipping: {
                enabled: n2b(enc[6][0]),
                values: enc[6][1],
            },
            pickup: {
                enabled: n2b(enc[7][0]),
                value: enc[7][1],
            },
            receipt: {
                enabled: n2b(enc[8]),
            },
        };
    } catch (_err) {
        const err = new Error(`Unable to decode metadata: ${rawMeta}`);

        console.error(err, _err);
        throw err;
    }
}
