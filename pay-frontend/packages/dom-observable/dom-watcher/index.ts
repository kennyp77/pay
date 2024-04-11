import { ClearDomWatcherFn, DomWatcherCallback } from '../types';

import { intervalWatcherNodes } from './interval-watcher-nodes';
import { mutationObserverWatcher } from './mutation-observer-watcher';

export const domWatcher = (watchNodes: string[], callback: DomWatcherCallback): ClearDomWatcherFn => {
    if ('MutationObserver' in window) {
        return mutationObserverWatcher(watchNodes, callback);
    }

    return intervalWatcherNodes(watchNodes, callback);
};
