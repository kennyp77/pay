import { createService } from '@yandex-pay/react-services';

import { RootState } from 'store';

import { PaymentState } from './state';

export const setPaymentStage = createService<RootState, [PaymentState['stage']]>(
    ({ produce }, data) => {
        produce((draft) => {
            draft.checkout.stage = data;
        });
    },
);

export const setPaymentOrder = createService<RootState, [PaymentState['order']]>(
    ({ produce }, data) => {
        produce((draft) => {
            draft.checkout.order = data;
        });
    },
);

export const setPaymentProcessData = createService<RootState, [PaymentState['processData']]>(
    ({ produce }, data) => {
        produce((draft) => {
            draft.checkout.processData = data;
        });
    },
);
