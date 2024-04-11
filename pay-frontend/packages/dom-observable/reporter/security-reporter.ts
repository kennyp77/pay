import { iframeScanner } from '../scanner';
import { ClearDomWatcherFn, DomWatcherCallback } from '../types';

const CSP_SERVICE_NAME = 'yandex-pay-frames';
const CSP_PROJECT_NAME = 'pay';

interface SecurityReporterParams {
    env: string;
    reqId: string;
}

const report = (src: string, params: SecurityReporterParams): void => {
    const enc = encodeURIComponent;
    let documentUri = '';
    let referrer = '';

    try {
        documentUri = window.location.href;
    } catch (unused) {
        /* nothing */
    }

    try {
        referrer = document.referrer;
    } catch (unused) {
        /* nothing */
    }
    const queryParams = [
        `from=${enc(CSP_SERVICE_NAME)}`,
        `project=${enc(CSP_PROJECT_NAME)}`,
        `env=${enc(params.env)}`,
        `reqId=${enc(params.reqId)}`,
    ].join('&');

    fetch(`https://csp.yandex.net/csp?${queryParams}`, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        body: JSON.stringify({
            'csp-report': {
                'document-uri': documentUri,
                referrer,
                'effective-directive': 'frame-src',
                'violated-directive': 'frame-src',
                'blocked-uri': src,
            },
        }),
    });
};

const checkSrc = (src: string, whitelist: string[]): boolean => {
    return !whitelist.some((link) => src.startsWith(link));
};

export const securityReporter = (
    whitelist: string[],
    params: SecurityReporterParams,
    callback?: DomWatcherCallback,
): ClearDomWatcherFn => {
    const frames = new WeakMap<Node, boolean>();

    const onNodeChange = (node: HTMLIFrameElement): void => {
        if (checkSrc(node.src || '', whitelist) && !frames.has(node)) {
            report(node.src, params);

            if (callback) {
                callback(node);
            }

            frames.set(node, true);
        }
    };

    return iframeScanner(onNodeChange);
};
