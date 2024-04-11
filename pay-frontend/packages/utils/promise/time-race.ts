import { wait } from './wait';

export function timeRace<T>(promise: Promise<T>, ms: number): Promise<T | void>;
export function timeRace<T>(promise: Promise<T>, ms: number, rejectWith: Error): Promise<T>;
export function timeRace<T>(
    promise: Promise<T>,
    ms: number,
    rejectWithFn: Sys.CallbackFn0,
): Promise<T>;
export function timeRace<T>(
    promise: Promise<T>,
    ms: number,
    rejectWith?: Error | Sys.CallbackFn0,
): Promise<T | void> {
    const timer = rejectWith
        ? wait(ms).then(() =>
              Promise.reject(rejectWith instanceof Error ? rejectWith : rejectWith()),
          )
        : wait(ms);

    return Promise.race([promise, timer]);
}
