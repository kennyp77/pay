import BaseCore from '../../core/base-core';
import DevelopmentConfig from '../development';

export default class DevelopmentCoreConfig extends DevelopmentConfig {
    core: BaseCore;

    constructor(core: BaseCore) {
        super();

        this.core = core;
    }
}
