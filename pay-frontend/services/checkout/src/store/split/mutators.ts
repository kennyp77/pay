import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';

export const setSplitAvailable = createService<RootState, [boolean]>(
    ({ getState, setState }, data) => {
        setState(
            produce(getState(), (draft) => {
                draft.split.isAvailable = data;
            }),
        );
    },
);

export const setSplitPlan = createService<RootState, [Async.Data<Checkout.SplitPlan>]>(
    ({ getState, setState }, data) => {
        setState(
            produce(getState(), (draft) => {
                draft.split.splitPlan = data;
            }),
        );
    },
);

export const resetSplitPlan = createService<RootState>(({ getState, setState }) => {
    setState(
        produce(getState(), (draft) => {
            draft.split.splitPlan = asyncData.initial();
        }),
    );
});

export const setPayWithSplit = createService<RootState, [boolean]>(
    ({ getState, setState }, data) => {
        setState(
            produce(getState(), (draft) => {
                draft.split.payWithSplit = data;
            }),
        );
    },
);
