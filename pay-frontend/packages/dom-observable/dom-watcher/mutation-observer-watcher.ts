import { ClearDomWatcherFn, DomWatcherCallback } from '../types';
import { nodeListForEach } from '../utils';

import { observeFunction as observeFunctionNodes } from './interval-watcher-nodes';

const OBSERVER_CONFIG = {
    childList: true,
    attributes: true,
    subtree: true,
};

const checkNode = (node: Node, watchNodes: string[], callback: DomWatcherCallback): void => {
    if (watchNodes.includes(node.nodeName.toLowerCase())) {
        callback(node);
    }
};

const observeFunction = (watchNodes: string[], callback: DomWatcherCallback): MutationCallback => {
    return (mutations: MutationRecord[]): void => {
        mutations.forEach((mutation) => {
            switch (mutation.type) {
                case 'childList':
                default:
                    nodeListForEach(mutation.addedNodes, (addedNode: Node) => {
                        checkNode(addedNode, watchNodes, callback);

                        observeFunctionNodes(watchNodes, callback, addedNode);
                    });

                    break;

                case 'attributes':
                    checkNode(mutation.target, watchNodes, callback);

                    break;
            }
        });
    };
};

export const mutationObserverWatcher = (watchNodes: string[], callback: DomWatcherCallback): ClearDomWatcherFn => {
    const observer = new MutationObserver(observeFunction(watchNodes, callback));

    observer.observe(document, OBSERVER_CONFIG);

    return (): void => observer.disconnect();
};
