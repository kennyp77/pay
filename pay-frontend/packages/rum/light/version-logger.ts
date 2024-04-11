import { getCommonVars } from './config';
import { send } from './send';

export function sendVersion(): void {
    send('690.1033', getCommonVars());
}
