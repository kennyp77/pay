import identity from '@tinkoff/utils/function/identity';
import { camelCase } from 'camel-case';

import { iterateTree } from './iterate-tree';

export function toCamelCase<V = any>(obj: V): V {
    return iterateTree<V>(obj, camelCase, identity);
}
