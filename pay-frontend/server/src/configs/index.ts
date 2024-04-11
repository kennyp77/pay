import { YaEnv } from '../typings/common';
import { getEnv } from '../utils';

import DevelopmentConfig from './development';
import ProductionConfig from './production';
import TestingConfig from './testing';

function getConfig(): ProductionConfig {
    const yaEnv = getEnv<YaEnv>('YA_ENV', 'production');

    if (yaEnv === 'development') {
        return new DevelopmentConfig();
    }

    if (yaEnv === 'testing') {
        return new TestingConfig();
    }

    return new ProductionConfig();
}

export default getConfig();
