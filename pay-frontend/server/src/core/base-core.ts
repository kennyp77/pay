/* eslint-disable @typescript-eslint/camelcase */

import { Core, express } from '@yandex-int/duffman';

import getCoreConfig from '../configs/core';
import type ProductionCoreConfig from '../configs/core/production';
import models from '../models';
import service from '../services';

import { HttpLogger, LogOptions } from './http-logger';

export default class BaseCore extends Core<typeof models, typeof service> {
    public req: express.Request;

    public res: express.Response;

    // NB: Жуткий костыль т.к. @yandex-int/duffman/Core.config = Record<string, unknown>
    // @ts-ignore
    public config: ProductionCoreConfig;

    logger: HttpLogger;

    constructor(req: express.Request, res: express.Response) {
        super(req, res);

        this.services = service;
        this.models = models;
        this.logger = new HttpLogger();
        this.config = getCoreConfig(this);
    }

    purchaseToken(): string {
        throw new Error('Must be implemented');
    }

    logCommonArgs(options: LogOptions = {}): LogOptions {
        return {
            ...options,
            x_real_ip: this.ip,
            x_request_id: this.getRequestId(),
            host: this.hostname,
        };
    }

    httpCommonArgs(options: LogOptions = {}): LogOptions {
        // Пробрасываем дополнительные параметры для http лога
        return {
            ...options,
            _http_log: {
                x_real_ip: this.ip,
                x_request_id: this.getRequestId(),
                host: this.hostname,
            },
        };
    }

    getRequestId() {
        return this.req.requestId;
    }
}
