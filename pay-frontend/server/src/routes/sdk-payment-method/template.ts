import config from '../../configs';
import { getFramesSrc } from '../../configs/csp/presets';
import { getRefererOrigin } from '../../helpers/request';
import { isAuth } from '../helpers/auth';
import { getAvatarId, getAvatarURL, hasAvatar } from '../helpers/blackbox';
import { isSplitAvailable } from '../helpers/split';
import WebCore from '../helpers/web-core';

export const getClientConfig = (
    core: WebCore,
    extData: Record<string, any> = {},
    testingFlags?: any,
): Record<string, any> => {
    const { query, blackbox } = core.req;
    const avatarId = getAvatarId(blackbox);

    return {
        version: core.config.version,
        env: core.config.env,
        reqid: core.getRequestId(),
        parentOrigin: getRefererOrigin(core.req),
        csrfToken: core.req.csrfToken,
        metrikaSessionId: query.msid || '',
        avatarUrl: getAvatarURL(avatarId),
        hasAvatar: Boolean(avatarId && hasAvatar(blackbox)),
        isAuth: isAuth(core, true),
        frameUrlWhitelist: getFramesSrc(config.yaCSP.presets),
        split: core.config.split,
        ...extData,
        features: {
            split: isSplitAvailable(core),
            testingFlags,
        },
    };
};
