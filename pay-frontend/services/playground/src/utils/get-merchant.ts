import clone from '@tinkoff/utils/clone';
import pathOr from '@tinkoff/utils/object/pathOr';
import * as Sdk from '@yandex-pay/sdk/src/typings';

import { DEV_USERNAME, BOLT_MERCHANTS, MERCHANTS } from '../config';

const EMPTY_MERCH = { id: '', name: '', url: '' };

export function getMerchant(index: number = 0): Sdk.Merchant {
    const { origin } = window.location;

    return pathOr([origin, index], EMPTY_MERCH, MERCHANTS);
}

export function getBoltMerchant() {
    const { origin } = window.location;

    const merchants = BOLT_MERCHANTS[origin];

    if (!Array.isArray(merchants)) {
        return EMPTY_MERCH;
    }

    if (DEV_USERNAME) {
        return merchants.find((merch: Sdk.Merchant) => merch.name === DEV_USERNAME) || EMPTY_MERCH;
    }

    return merchants[0] || EMPTY_MERCH;
}

export function getMerchantMatchesName(name: string): Sdk.Merchant {
    const { origin } = window.location;

    return clone(MERCHANTS[origin].find((merch) => merch.name.includes(name)) || EMPTY_MERCH);
}
