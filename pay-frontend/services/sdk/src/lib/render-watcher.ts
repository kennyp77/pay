import { isElement, delayCall, waitUntil } from './tools';

type WatcherCb = Sys.CallbackFn1<string>;
type WatcherUnsubscribe = Sys.CallbackFn0;

const RENDER_THRESHOLD = 0.5;

function ioWatcher(node: HTMLElement, callback: WatcherCb): WatcherUnsubscribe {
    const observer = new IntersectionObserver(
        ([entry]): void => {
            if (entry && entry.isIntersecting && entry.intersectionRatio >= RENDER_THRESHOLD) {
                callback('io');
                observer.unobserve(node);
            }
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(node);

    return (): void => observer.unobserve(node);
}

function rafWatcher(node: HTMLElement, callback: WatcherCb): WatcherUnsubscribe {
    const check = (): boolean => {
        const rect = node.getBoundingClientRect();
        const { width, height } = rect;

        const bottom = window.innerHeight - rect.bottom;
        const right = window.innerWidth - rect.right;

        const ratioH = Math.max(0, height + Math.min(0, rect.top, bottom)) / height;
        const ratioW = Math.max(0, width + Math.min(0, rect.left, right)) / width;

        const intersectionRatio = ratioH * ratioW;

        return intersectionRatio >= RENDER_THRESHOLD;
    };

    return waitUntil(check, () => callback('raf'));
}

function mountWatcher(node: HTMLElement, callback: WatcherCb): WatcherUnsubscribe {
    let delayTimer: NodeJS.Timeout;

    const check = (): void => {
        delayTimer = null;
        if (!(document.body && document.body.contains)) {
            callback('timer');
        } else if (document.body === node || document.body.contains(node)) {
            callback('mount');
        } else {
            delayTimer = delayCall(check);
        }
    };

    delayTimer = delayCall(check, 0);

    return (): void => {
        if (delayTimer) {
            clearTimeout(delayTimer);
        }
    };
}

export function renderWatcher(node: HTMLElement, callback: WatcherCb): WatcherUnsubscribe {
    if (!isElement(node)) {
        return (): void => undefined;
    }

    if (window.IntersectionObserver) {
        return ioWatcher(node, callback);
    }

    if (node.getBoundingClientRect) {
        return rafWatcher(node, callback);
    }

    return mountWatcher(node, callback);
}
