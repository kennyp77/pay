import { isProd } from '../../helpers/common';

import { isUserInWhitelist } from './users';
import WebCore from './web-core';

const FF_PROD_LOGINS = [
    // Yandex Staff
    'lyadzhin',
    'alexgolovin',
    'stepler',
    'kir.98-13',
    'polrkov',
    'nkorchin',
    'ivaxer',
    'simon.moiseenko',
    'supersk0',
    'ramis.yamilov',
    'paramoshkin.d',
    'prokhorenkomaks',
    // External Staff
    'naskovets.a',
    'ilya.gerish',
    'raaaf@yandex.ru',
].map((s) => s.toLowerCase());

export function isUserForFF(core: WebCore): boolean {
    if (!isProd) {
        return false;
    }

    return isUserInWhitelist(core, FF_PROD_LOGINS);
}
