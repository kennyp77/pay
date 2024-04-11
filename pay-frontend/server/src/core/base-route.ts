/* eslint-disable @typescript-eslint/camelcase */

import { Readable } from 'stream';

import _get from 'lodash/get';
import serialize from 'serialize-javascript';

import { ApiError } from '../errors';
import { render, RenderData } from '../helpers/render';
import { MimeTypes, Req, Res } from '../typings/common';
import { extractErrorMessage } from '../utils';

import type BaseCore from './base-core';

type Router = (req: Req, res: Res) => Promise<void>;

export type LogArgs = Record<string, any>;

export type ErrorCode = number;
export type ErrorData = { error: string; message?: string };

export type ResCode = number;
export type ResHeaders = Record<string, string>;
export type ResponseData = string | Record<string, any> | Buffer;

export default class BaseRouter<Core extends BaseCore> {
    name: string;

    type: MimeTypes;

    router: Router;

    logPayload = false;

    constructor(name: string, type: MimeTypes, CoreCtor: new (...args: any) => Core) {
        this.name = `router ${name}`;
        this.type = type;

        this.router = ((req, res) => {
            const core = new CoreCtor(req, res, this.name);

            return this._router(core).catch(this._exception.bind(this, core));
        }) as Router;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async prepare(core: Core): Promise<void> {
        // pass
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async process(core: Core): Promise<void> {
        // pass
    }

    async processError(core: Core, code: ErrorCode, data: ErrorData): Promise<void> {
        return this.send(core, code, data);
    }

    async send(core: Core, code: ResCode, data: ResponseData, headers?: ResHeaders): Promise<void> {
        return this._send(core, code, this._escape(data), headers);
    }

    async redirect(core: Core, url: string, code: ResCode = 302): Promise<void> {
        return core.res.redirect(code, url);
    }

    render(core: Core, tpl: string, data: RenderData): string {
        core.logger.info('RENDER_DATA', {
            ...this._logRequestArgs(core),
            // TODO: Класть пейлоад в его собственное поле YANDEXPAY-1571
            //       А пока его нет, кладем в неиспользуемый project
            project: data,
        });

        return render(tpl, data, core.req.nonce);
    }

    _preAction(core: Core): void {
        core.yasm.sum('route_count');
        core.yasm.sum(`route_${this.name}_count`);
        core.timing.start(this.name);
    }

    _escape(result: ResponseData): ResponseData {
        if (result instanceof Buffer || result instanceof Readable) {
            return result;
        }

        if (this.type === MimeTypes.json) {
            return serialize(result, { isJSON: true });
        }

        return result;
    }

    _send(core: Core, code: ResCode, data: ResponseData, headers?: ResHeaders): Promise<void> {
        return new Promise((resolve) => {
            if (!core.res.headersSent) {
                core.res.status(code);
                core.res.set('Content-Type', this.type);

                if (headers) {
                    core.res.set(headers);
                }

                core.res.send(data);
            }

            resolve();
        });
    }

    async _router(core: Core): Promise<void> {
        const errors: string[] = [];

        try {
            this._preAction(core);
            await this.prepare(core);
            await this.process(core);
        } catch (err) {
            errors.push(extractErrorMessage(err));
            try {
                await this._error(core, err);
            } catch (_err) {
                errors.push(extractErrorMessage(_err));
                core.yasm.sum('route_common_request_exception');
                core.yasm.sum(`route_${this.name}_common_request_exception`);
                await this.processError(core, 500, { error: 'COMMON_REQUEST_EXCEPTION' });
            }
        }

        try {
            await this._end(core);
        } catch (err) {
            errors.push(extractErrorMessage(err));
        }

        this._finish(core, errors.join(' '));
    }

    _end(core: Core): Promise<void> {
        return new Promise((resolve, reject) => {
            core.res.once('finish', resolve);
            core.res.once('error', reject);
            core.res.end();
        });
    }

    _logRequestArgs(core: Core): LogArgs {
        return core.logCommonArgs({
            url: core.req.originalUrl,
            method: core.req.method,
            headers: {
                origin: core.req.headers.origin,
                referer: core.req.headers.referer,
                cookie: [
                    `yandexuid=${_get(core.req.cookies, 'yandexuid', '')}`,
                    `yandex_login=${_get(core.req.cookies, 'yandex_login', '')}`,
                ].join('; '),
                user_agent: core.req.headers['user-agent'],
            },
            // TODO: Класть пейлоад в его собственное поле YANDEXPAY-1571
            //       А пока его нет, кладем в неиспользуемый project
            project: this.logPayload ? core.req.body : null,
        });
    }

    async _error(core: Core, error: Error): Promise<void> {
        if (error instanceof ApiError) {
            const { code, message, method } = error;
            core.logger.error('API_ERROR', {
                ...this._logRequestArgs(core),
                status: code,
                message,
                method,
            });

            const codeStr = `${code.toString()[0]}xx`;

            core.yasm.sum(`methods_${core.req.apiVer}_${core.req.apiMethod}_${codeStr}_count`);

            await this.processError(core, code, { error: 'API_ERROR', message });
        } else {
            const { message, stack } = error;
            core.yasm.sum('route_common_request_error');
            core.yasm.sum(`route_${this.name}_common_request_error`);

            core.logger.error('COMMON_REQUEST_ERROR', {
                ...this._logRequestArgs(core),
                status: 500,
                message,
                stack,
            });

            core.yasm.sum(`methods_${_get(core.req, 'apiVer')}_${_get(core.req, 'apiMethod')}_5xx_count`);

            if (!core.res.finished) {
                await this.processError(core, 500, { error: 'COMMON_REQUEST_ERROR' });
            }
        }
    }

    _finish(core: Core, error: string): void {
        const livetime = core.timing.stop(this.name);

        core.logger.info('REQUEST_FINISHED', {
            ...this._logRequestArgs(core),
            status: core.res.statusCode,
            livetime: livetime.msec(),
            size: _get(core.res, '_contentLength'),
            error,
        });
        core.yasm.hist('route_timings', livetime.ms());
        core.yasm.hist(`route_${this.name}_timings`, livetime.ms());
    }

    _exception(core: Core, error: Error): void {
        // @ts-ignore
        process.emit('yasm', {
            name: 'custom.sum',
            signalName: 'route_uncaught_request_exception',
        });
        core.logger.error('UNCAUGHT_REQUEST_EXCEPTION', {
            ...this._logRequestArgs(core),
            message: error.message || error,
            stack: error.stack,
        });
    }
}
