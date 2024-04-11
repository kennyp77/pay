import { hasUserPhone } from './blackbox';
import { userHasAccessToFeature } from './has-access';
import WebCore from './web-core';

export function isSplitAvailable(core: WebCore): boolean {
    const { blackbox } = core.req;
    const hasPhone = hasUserPhone(blackbox);

    if (!hasPhone) {
        return false;
    }

    return userHasAccessToFeature('split', core);
}
