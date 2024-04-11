import isBoolean from '@tinkoff/utils/is/boolean';
import { logError } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import * as transform from '../../api-transform/payment';
import * as api from '../../api/pay-api';
import { counters } from '../../counters';
import { getSheet } from '../payment';

import { isPayWithSplit, isSplitAvailable, setPayWithSplit, setSplitPlan } from '.';

export const togglePayWithSplit = createService<RootState, [boolean?]>(function togglePayWithSplit(
    { getState, dispatch },
    forceValue,
) {
    const value = isBoolean(forceValue) ? forceValue : !isPayWithSplit(getState());

    counters.toggleSplit(value);

    dispatch(setPayWithSplit(value));
});

export const loadSplitPlan = createService<RootState>(async function loadSplitPlan({
    getState,
    dispatch,
}) {
    try {
        const state = getState();
        const sheet = getSheet(state);

        if (!isSplitAvailable(state)) {
            return;
        }

        const response = await api.loadSplitPlans(sheet);
        const splitPlan = transform.splitPlan(response);

        if (splitPlan) {
            await dispatch(setSplitPlan(asyncData.success(splitPlan)));
        }
    } catch (error) {
        logError(error, { fn: 'loadSplitPlan' });

        await dispatch(setSplitPlan(asyncData.error('Unable to load splitPlan')));

        // Не падаем, если загрузить Сплит не вышло
        // throw error;
    }
});
