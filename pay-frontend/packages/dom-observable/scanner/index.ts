import { domWatcher } from '../dom-watcher';
import { ClearDomWatcherFn, DomWatcherCallback } from '../types';

export const iframeScanner = (callback: DomWatcherCallback): ClearDomWatcherFn => domWatcher(['iframe'], callback);
