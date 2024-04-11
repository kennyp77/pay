import toLower from 'lodash/toLower';

import { getUID, getLogin, getRawLogin } from './blackbox';
import WebCore from './web-core';

export function isUserInWhitelist(core: WebCore, whiteList: string[]): boolean {
    const userUid = getUID(core.req.blackbox);
    const userLogin = toLower(getLogin(core.req.blackbox));
    const userRawLogin = toLower(getRawLogin(core.req.blackbox));

    return (
        whiteList.includes(userUid) ||
        whiteList.includes(userLogin) ||
        whiteList.includes(userRawLogin)
    );
}
