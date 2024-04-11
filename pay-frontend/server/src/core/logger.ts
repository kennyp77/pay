import BaseLogger from '@yandex-int/duffman/lib/abstract-logger';

type LogArgs = {
    [key: string]: string;
};

export type LogOptions = Record<string, any>;

export class Logger extends BaseLogger {
    _prepareArgs(reason: string, args: LogArgs = {}): LogArgs {
        return { reason, ...args };
    }
}

export default new Logger('duffman-server-log', 'server:common');
