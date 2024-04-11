import { isProd } from '../../helpers/common';

import { isStaffAccount } from './blackbox';
import { getFeatureStatus } from './bunker';
import { isUserInWhitelist } from './users';
import WebCore from './web-core';

export const userHasAccessToFeature = (featureName: string, core: WebCore): boolean => {
    if (!isProd) {
        return true;
    }

    const { blackbox } = core.req;
    const status = getFeatureStatus(core.req.bunker, featureName);

    if (!status) {
        return false;
    }

    return (
        status.public ||
        (status.staff && isStaffAccount(blackbox)) ||
        (status.whitelist && isUserInWhitelist(core, status.whitelist_users))
    );
};
