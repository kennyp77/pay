function amountMul(amountA: number | string, amountB: number | string): string {
    return (Number(amountA) * Number(amountB)).toFixed(2);
}

export enum Coupon {
    Valid10 = '4C4B40',
    Valid50 = '8F3A0C',
    Expired = '3D0900',
}

type ValidateCouponResult = {
    error?: { code: 'COUPON'; status: 'INVALID' | 'EXPIRED'; message: string };
    // Для JS API
    amount?: string;
    // Для B2B API
    discount?: number;
};

export function validateCoupon(coupon: string, amount: string): ValidateCouponResult {
    if (coupon === Coupon.Valid10) {
        return {
            amount: amountMul(amount, -0.1),
            discount: 0.1,
        };
    }

    if (coupon === Coupon.Valid50) {
        return {
            amount: amountMul(amount, -0.5),
            discount: 0.5,
        };
    }

    if (coupon === Coupon.Expired) {
        return {
            error: {
                code: 'COUPON',
                status: 'EXPIRED',
                message: 'Действие промокода закончилось',
            },
        };
    }

    return {
        error: {
            code: 'COUPON',
            status: 'EXPIRED',
            message: 'Промокод не найден',
        },
    };
}
