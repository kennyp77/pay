import identity from '@tinkoff/utils/function/identity';
import { snakeCase } from 'snake-case';

import { iterateTree } from './iterate-tree';

export function toSnakeCase<V = any>(obj: V): V {
    return iterateTree<V>(obj, snakeCase, identity);
}
