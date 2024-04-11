import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';
import { ShippingType } from '../../typings';

export const setShippingOptionsList = createService<RootState, [Async.Data<Sdk.ShippingOption[]>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.directShipping.list = asyncData;
            }),
        );
    },
);

export const setDisableShippingOptions = createService<RootState, [boolean]>(
    ({ getState, setState }, disable) => {
        setState(
            produce(getState(), (draft) => {
                draft.directShipping.disable = disable;
            }),
        );
    },
);

export const setSelectShippingOptions = createService<RootState, [Async.Data<void>]>(
    ({ getState, setState }, asyncData) => {
        setState(
            produce(getState(), (draft) => {
                draft.directShipping.selectOption = asyncData;
            }),
        );
    },
);

export const setSelectedId = createService<RootState, [Sdk.ShippingOptionId]>(
    ({ getState, setState }, selectedId) => {
        setState(
            produce(getState(), (draft) => {
                draft.directShipping.selectedId = selectedId;
            }),
        );
    },
);

export const setSelectedShippingType = createService<RootState, [ShippingType]>(
    ({ getState, setState }, type) => {
        setState(
            produce(getState(), (draft) => {
                draft.shipping.type = type;
            }),
        );
    },
);
