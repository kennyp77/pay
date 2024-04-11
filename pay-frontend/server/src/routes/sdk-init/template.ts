import config from '../../configs';
import { getFramesSrc } from '../../configs/csp/presets';
import { getRefererOrigin } from '../../helpers/request';
import { getAvatarId } from '../helpers/blackbox';
import WebCore from '../helpers/web-core';

const getAvatarURL = (avatarId: string, isRetina = true): string =>
    `${config.avatarUrl}/get-yapic/${avatarId}/${
        isRetina ? 'islands-retina-middle' : 'islands-middle'
    }`;

export const getClientConfig = (
    core: WebCore,
    extData: Record<string, any> = {},
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
        avatarUrl: avatarId ? getAvatarURL(avatarId) : '',
        frameUrlWhitelist: getFramesSrc(config.yaCSP.presets),
        ...extData,
    };
};
