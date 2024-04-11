import { waitUntil } from './tools';

export function onBodyCreate(callback: Sys.CallbackFn0): Sys.CallbackFn0 {
    return waitUntil(() => Boolean(document.body), callback, 10);
}
