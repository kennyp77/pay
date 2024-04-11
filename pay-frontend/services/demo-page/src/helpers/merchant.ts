import * as Sdk from '@yandex-pay/sdk/src/typings';

import { MERCHANTS } from '../config';

export function getMerchant(): Sdk.Merchant {
    const { origin } = window.location;

    return MERCHANTS[origin] || { id: '', name: '' };
}
