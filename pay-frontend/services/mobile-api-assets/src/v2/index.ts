import { combine } from '@trust/utils/mix/combine';

import { ISSUERS, getIcon } from './icons';

export default combine({
    issuer: ISSUERS,
    variant: ['full', 'short'],
    theme: ['light', 'dark', 'mono'],
}).map((params) =>
    getIcon(params.issuer as string, params.variant as string, params.theme as string),
);
