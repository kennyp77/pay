import { logError } from '@trust/rum';
import { asyncData } from '@trust/utils/async';
import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import * as api from '../../api/pay-api';
import { CASH_KEY } from '../../helpers/payment-method';
import { getActivePaymentId } from '../payment-methods';

import { getSheet } from './selectors';

import { resetCashback, setCashback } from '.';

export const loadCashback = createService<RootState>(async function loadCashback({
    getState,
    dispatch,
}) {
    try {
        const sheet = getSheet(getState());
        const cardId = getActivePaymentId(getState());

        if (cardId === CASH_KEY) {
            await dispatch(resetCashback());
        } else {
            const response = await api.loadCashback({ sheet, cardId });

            await dispatch(setCashback(asyncData.success(response.data.cashback)));
        }
    } catch (error) {
        logError(error, { fn: 'loadCashbackAction' });

        await dispatch(setCashback(asyncData.error('Unable to load cashback')));
    }
});
