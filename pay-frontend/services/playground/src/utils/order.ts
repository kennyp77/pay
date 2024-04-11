import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { random } from '@trust/utils/string/random';

const idSuffix = memoizeOnce((version: number) => `${version}-${random(15)}`);

export function getOrderId(prefix: string, version: number) {
    return `${prefix}-${idSuffix(version)}`;
}
