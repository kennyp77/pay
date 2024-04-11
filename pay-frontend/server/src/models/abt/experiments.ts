import { ABTSplitter } from '@yandex-int/abt';
import { flags } from '@yandex-int/duffman';
import _ from 'lodash';

import config from '../../configs';
import BaseCore from '../../core/base-core';
import { AbtExps } from '../../typings/common';

const abt = new ABTSplitter({
    service: config.abt.service,
    handler: config.abt.handler,
});

let confHeaders = _.get(config.abt, ['headers'], {});
if (!_.isPlainObject(confHeaders)) {
    confHeaders = {};
}

const parseAbtInfo = (info: Record<string, any>): AbtExps => {
    return _.pick(info, ['flags', 'experiments']);
};

export default async function experiments(params: any, core: BaseCore): Promise<AbtExps> {
    const appInfo = {
        version: String(config.abt.serviceId),
        // TODO: Смотреть через uatraits
        deviceType: 'desktop',
    };

    const headers = _.assign(confHeaders, {
        'Y-Service': config.abt.service,
    });

    try {
        const res = await core.service('uaas')('', { appInfo, headers });
        const info = abt.parseInfo(res.headers);

        return parseAbtInfo(info);
    } catch (error) {
        core.logger.error('Get experiments error', {
            message: error.message || error,
            stack: error.stack,
            headers,
        });
    }

    return { flags: {}, experiments: '' };
}

experiments[flags.NO_AUTH] = true;
experiments[flags.NO_CKEY] = true;
