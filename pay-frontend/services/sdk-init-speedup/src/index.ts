import { getOrigin } from '@trust/utils/url';

const cfg = window.__CONFIG || {};

const ENV: any = cfg.env || 'production';
const PARENT_ORIGIN: any = cfg.parentOrigin || {};
const EXPERIMENT: any = cfg.experiment || {};
const READY_TO_PAY: any = Boolean(cfg.readyToPay);

function send(type: string, data: Record<string, any>): void {
    if (window.parent && window.parent.postMessage) {
        const message = JSON.stringify({
            payload: { ...data, type },
        });
        window.parent.postMessage(message, getOrigin(PARENT_ORIGIN, '*'));
    }
}

send('sdk-ready-exp', { readyToPay: READY_TO_PAY, experiment: EXPERIMENT, env: ENV });
