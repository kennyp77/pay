import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import { isSplitAvailable } from '../../helpers/split';
import { loadCashback } from '../payment';
import { loadSplitPlan, setSplitAvailable } from '../split';

export const updatePaymentInfo = createService<RootState>(function updatePaymentInfo({
    getState,
    dispatch,
}) {
    const { sheet } = getState().payment;

    dispatch(setSplitAvailable(isSplitAvailable(sheet)));

    return Promise.all([dispatch(loadCashback()), dispatch(loadSplitPlan())]);
});
