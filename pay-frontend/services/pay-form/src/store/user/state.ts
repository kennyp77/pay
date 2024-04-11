import {
    PaymentCashback,
    PaymentMethod,
    PaymentMethodKey,
} from '@trust/utils/payment-methods/typings';

export interface UserState {
    paymentMethods: PaymentMethod[];
    activePaymentMethodKey: PaymentMethodKey | void;
    savedCard: string | undefined;
    cashback: PaymentCashback;
}

export const stateIdentifier = 'user';

export const createState = (): UserState => ({
    paymentMethods: [],
    activePaymentMethodKey: undefined,
    savedCard: undefined,
    cashback: {
        amount: '',
        category: '',
    },
});
