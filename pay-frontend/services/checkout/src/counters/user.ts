import { count } from './utils';

const onboardedStatusCounter = count('onboarded_status');
export const onboardedStatus = (status: 'onboarded' | 'unonboarded') =>
    onboardedStatusCounter({ status });
