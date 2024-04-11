import type BaseCore from '../../core/base-core';
import { YaEnv } from '../../typings/common';
import { getEnv } from '../../utils';

import DevelopmentCoreConfig from './development';
import ProductionCoreConfig from './production';
import TestingCoreConfig from './testing';

export default function getCoreConfig(core: BaseCore): ProductionCoreConfig {
    const yaEnv = getEnv<YaEnv>('YA_ENV', 'production');

    if (yaEnv === 'development') {
        return new DevelopmentCoreConfig(core);
    }

    if (yaEnv === 'testing') {
        return new TestingCoreConfig(core);
    }

    return new ProductionCoreConfig(core);
}
