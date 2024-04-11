import { asyncData } from '@trust/utils/async';
import { PaymentCashback } from '@trust/utils/payment-methods/typings';
import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';

export const setSheet = createService<RootState, [Sdk.PaymentSheet]>(
    ({ getState, setState }, sheet) => {
        setState(
            produce(getState(), (draft) => {
                draft.payment.sheet = sheet;
            }),
        );
    },
);

export const setSheetOrder = createService<RootState, [Sdk.Order]>(
    ({ getState, setState }, order) => {
        setState(
            produce(getState(), (draft) => {
                draft.payment.sheet.order = order;
            }),
        );
    },
);

export const setEmail = createService<RootState, [string]>(({ getState, setState }, email) => {
    setState(
        produce(getState(), (draft) => {
            draft.payment.email = email;
        }),
    );
});

export const setCashback = createService<RootState, [Async.Data<PaymentCashback>]>(
    ({ getState, setState }, data) => {
        setState(
            produce(getState(), (draft) => {
                draft.payment.cashback = data;
            }),
        );
    },
);

export const resetCashback = createService<RootState>(async ({ dispatch }) => {
    await dispatch(setCashback(asyncData.initial()));
});
