import { getConfig, getCommonVars } from './config';
import { send } from './send';

type LogLevel = 'error' | 'warn' | 'fatal' | 'info' | 'debug';

interface LogErrorOptions {
    message: string;
    level: LogLevel;
    additional?: Record<string, any>;
}

interface LogFn {
    (reason: string, error?: Error): void;
}

function getErrorData({ message, level = 'error', additional }: LogErrorOptions): object {
    const config = getConfig();

    return {
        ...getCommonVars(),
        // заполняется в событии браузера или передается вручную
        '-msg': message,

        // критичность
        '-level': level,

        // хэш с дополнительными параметрами
        '-additional': JSON.stringify(additional || {}),

        // ua - попробуем брать из кук
        '-ua': navigator.userAgent,

        // клиентское время ошибки
        '-ts': Date.now(),
        '-init-ts': config.initTimestamp,
    };
}

function _logError(options: LogErrorOptions): void {
    const errorData = getErrorData(options);

    send('690.2354', errorData); // tech.client_error
}

function getLogLevelFn(level: LogLevel): LogFn {
    return function logMessage(reason: string, error?: Error): void {
        const additional = error ? { error: error.message } : null;

        _logError({ level, message: reason, additional });
    };
}

export const logFatal = getLogLevelFn('fatal');

export const logError = getLogLevelFn('error');

export const logWarn = getLogLevelFn('warn');

export const logInfo = getLogLevelFn('info');

export const logDebug = getLogLevelFn('debug');
