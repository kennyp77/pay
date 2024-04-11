import headersMasks from '@yandex-int/duffman/lib/core/helpers/headers-masks';
import _isPlainObject from 'lodash/isPlainObject';
import _mapValues from 'lodash/mapValues';

import { Logger } from './logger';

type LogArgs = {
    [key: string]: string;
};

export type LogOptions = Record<string, any>;

export default class HttpLogger extends Logger {
    constructor() {
        super('duffman-http-log', 'server:http');
    }

    /*
     * NB: Костыль!
     * Дафман для дебаг-режима выводит аргументы не прогоняя их через _prepareArgs
     * Из-за этого не видно было ли применено маскирование
     */
    _log(level: any, reason: string, args: LogArgs = {}): void {
        if (args.headers) {
            // eslint-disable-next-line no-param-reassign
            args.headers = this._headersMasker(args.headers);
        }

        super._log(level, reason, args);
    }

    _prepareArgs(reason: string, args: LogArgs = {}): LogArgs {
        return { reason, ...args };
    }

    _headersMasker = (headers: any): any => {
        if (!_isPlainObject(headers)) {
            return headers;
        }

        return _mapValues(headers, (headerValue, key) => {
            const mask = headersMasks[key.toLowerCase()];

            if (typeof mask === 'function') {
                return mask(headerValue);
            }
            if (typeof mask === 'string') {
                return mask;
            }

            return headerValue;
        });
    };
}

export { HttpLogger };
