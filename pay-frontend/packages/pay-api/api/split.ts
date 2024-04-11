import send from '../lib/send';
import { ApiResponseSuccess } from '../types';

type SplitPlanResponse = {
    plans: Array<{
        id: string;
        sum: string;
        payments: Array<{
            status: 'coming' | 'paid' | 'failed' | 'canceled';
            datetime: string;
            amount: string;
        }>;
    }>;
};

export function loadSplitPlans(sheet: any): Promise<ApiResponseSuccess<SplitPlanResponse>> {
    const url = '/api/v1/split/get-plans';

    return send.post(url, { sheet });
}
