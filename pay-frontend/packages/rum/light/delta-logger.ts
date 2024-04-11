import { getCommonVars } from './config';
import { send } from './send';

const deltaMarks: Record<string, [number?, number?, object?]> = {};

/**
 * Подготовить значение к отправке: строку - закодировать,
 * число - пересчитать относительно заданного смещения и
 * округлить до трёх знаков после запятой.
 */
function normalize(x: string | number, offset?: number): string | number {
    return typeof x === 'string'
        ? encodeURIComponent(x)
        : Math.round((x - (offset || 0)) * 1000) / 1000;
}

/**
 * Отправить счетчик с дельтой времени.
 */
function sendDelta(counterId: string): void {
    const deltaTimes = deltaMarks[counterId];

    let deltaStart;
    let deltaEnd;
    let deltaVars;

    if (deltaTimes) {
        [deltaStart, deltaEnd, deltaVars] = deltaTimes;
    }

    if (deltaStart === undefined || deltaEnd === undefined) {
        return;
    }

    const vars: Record<string, string | number> = {
        1701: counterId, // id – идентификатор счётчика
        207.2154: normalize(deltaStart), // time.start
        207.1428: normalize(deltaEnd), // time.end
        2877: normalize(deltaEnd - deltaStart), // delta
    };

    Object.entries(deltaVars).forEach(([paramName, paramValue]) => {
        vars[paramName] = String(paramValue);
    });

    send('690.2096.2877', vars); // tech.perf.delta

    delete deltaMarks[counterId];
}

/**
 * Записывает время старта расчёта дельты.
 */
export function timeStart(counterId: string): void {
    deltaMarks[counterId] = [Date.now()];
}

/**
 * Отмечает время окончания расчёта дельты и отправляет дельту.
 */
export function timeEnd(counterId: string): void {
    const deltaTimes = deltaMarks[counterId];

    if (!deltaTimes || deltaTimes.length === 0) {
        return;
    }

    deltaTimes.push(Date.now(), getCommonVars());

    sendDelta(counterId);
}
