import BaseCore from '../../core/base-core';
import ProductionConfig from '../production';

export default class ProductionCoreConfig extends ProductionConfig {
    core: BaseCore;

    constructor(core: BaseCore) {
        super();

        this.core = core;
    }
}
