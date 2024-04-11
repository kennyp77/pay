import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';

export const setSelectedId = createService<RootState, [Checkout.PaymentMethodId]>(
    ({ getState, setState }, selectedId) => {
        setState(
            produce(getState(), (draft) => {
                draft.paymentMethods.selectedId = selectedId;
            }),
        );
    },
);

export const setPaymentMethods = createService<RootState, [Async.Data<Checkout.PaymentMethod[]>]>(
    ({ getState, setState }, data) => {
        setState(
            produce(getState(), (draft) => {
                draft.paymentMethods.list = {
                    ...draft.paymentMethods.list,
                    ...data,
                };
            }),
        );
    },
);
