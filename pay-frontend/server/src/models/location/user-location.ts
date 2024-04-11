import { flags } from '@yandex-int/duffman';

import BaseCore from '../../core/base-core';
import { LaasLocation } from '../../typings/common';

interface UserLocationResponse {
    location?: LaasLocation;
}

export default async function userLocation(
    params: any,
    core: BaseCore,
): Promise<UserLocationResponse> {
    try {
        const { latitude, longitude } = await core.service('laas')('/region');

        return { location: { latitude, longitude } };
    } catch (error) {
        core.logger.error('Get user location error', {
            message: error.message || error,
            stack: error.stack,
        });
    }

    return { location: null };
}

userLocation[flags.NO_AUTH] = true;
userLocation[flags.NO_CKEY] = true;
