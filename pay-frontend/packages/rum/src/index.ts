import { IBaseError } from '@trust/fetch';

import { getErrorExtraData } from './get-error-extra-data';
import { getMissingErrorName } from './get-missing-error-name';

interface LogFn {
    (message: string, error?: Error): void;
    (error: Error, additional?: Ya.Rum.Additional): void;
    // TODO: сделать обработку для неизвестного типа
    (error: unknown, additional?: Ya.Rum.Additional): void;
}

const FallbackYaRum = {
    Rum: {
        logError: (): void => undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        time: (counterId: string): void => undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        timeEnd: (counterId: string, vars?: object): void => undefined,
    },
};

const { Ya = FallbackYaRum } = window;

function getLogLevelFn(level: Ya.Rum.LogLevel): LogFn {
    return function logMessage(
        error: string | Error,
        additional?: Error | IBaseError | Ya.Rum.Additional,
    ): void {
        if (__DEV__) {
            console[level === 'fatal' ? 'error' : level](error, additional);
        }

        if (typeof error === 'string') {
            const extra = getErrorExtraData(additional as IBaseError);

            Ya.Rum.logError(
                { level, message: error, additional: { ...extra } },
                { ...(additional as Error) },
            );
        } else {
            const extra = getErrorExtraData(error);

            Ya.Rum.logError(
                {
                    level,
                    // Add error constructor name, to the final message, because Rum ignores them for now
                    message: getMissingErrorName(error),
                    additional: {
                        ...additional,
                        ...extra,
                    },
                },
                error,
            );
        }
    } as LogFn;
}

export const logFatal = getLogLevelFn('fatal');

export const logError = getLogLevelFn('error');

export const logWarn = getLogLevelFn('warn');

export const logInfo = getLogLevelFn('info');

export const logDebug = getLogLevelFn('debug');

export const timeStart = (counterId: string): void => Ya.Rum.time(counterId);

export const timeEnd = (counterId: string, vars?: object): void => Ya.Rum.timeEnd(counterId, vars);

export const { Rum } = Ya;
