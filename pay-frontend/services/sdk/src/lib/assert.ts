import { AssertError } from './errors';

export function assert(ok: boolean, errorMessage: string): void {
    if (!ok) {
        throw new AssertError(errorMessage);
    }
}
