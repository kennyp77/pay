import { ClearDomWatcherFn, DomWatcherCallback } from '../types';
import { nodeListForEach } from '../utils';

const OBSERVER_TIMER = 1000; // 1 секунда

export const observeFunction = (watchNodes: string[], callback: DomWatcherCallback, target: Node = document): void => {
    if ('querySelectorAll' in target) {
        const lists: NodeList[] = [];

        watchNodes.forEach((node) => {
            lists.push((target as Element).querySelectorAll(node));
        });

        lists.forEach((elements) => nodeListForEach(elements, callback));
    }
};

export const intervalWatcherNodes = (watchNodes: string[], callback: DomWatcherCallback): ClearDomWatcherFn => {
    const timer = setInterval(() => {
        observeFunction(watchNodes, callback);
    }, OBSERVER_TIMER);

    return (): void => clearInterval(timer);
};
