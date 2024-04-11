import BaseRouter, { ResponseData, ErrorData, ErrorCode } from '../../../core/base-route';
import { MimeTypes } from '../../../typings/common';
import { isAuth } from '../../helpers/auth';
import { hasAvatar, getAvatarId, getAvatarURL } from '../../helpers/blackbox';
import { renderJSON } from '../../helpers/render-json';
import WebCore from '../../helpers/web-core';

const FORBIDDEN_ERROR = 'FORBIDDEN';

class MobApiUserInfoRoute extends BaseRouter<WebCore> {
    constructor() {
        super('mobile_api-user_info', MimeTypes.json, WebCore);
    }

    async process(core: WebCore): Promise<void> {
        const { blackbox } = core.req;

        if (!isAuth(core, true)) {
            const json = renderJSON(403, 'fail', FORBIDDEN_ERROR);

            return this.send(core, 403, json);
        }

        const responseData: ResponseData = {
            uid: blackbox.uid,
            name: blackbox.displayName,
        };

        if (hasAvatar(blackbox)) {
            const avatarId = getAvatarId(blackbox);

            responseData.avatar = {
                lodpiUrl: getAvatarURL(avatarId, false),
                hidpiUrl: getAvatarURL(avatarId, true),
            };
        }

        const json = renderJSON(200, 'success', responseData);

        return this.send(core, 200, json);
    }

    processError(core: WebCore, code: ErrorCode, data: ErrorData): Promise<void> {
        const json = renderJSON(code, 'fail', data.error);

        return this.send(core, code, json);
    }
}

export default new MobApiUserInfoRoute().router;
