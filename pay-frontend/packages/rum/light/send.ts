import { getConfig } from './config';

function createVarsString(vars: object): string {
    return Object.entries(vars)
        .reduce((varsArr, [key, value]) => {
            if (value || value === 0) {
                varsArr.push(`${key}=${encodeURIComponent(value).replace(/\*/g, '%2A')}`);
            }

            return varsArr;
        }, [])
        .join(',');
}

function getPayload(path?: string, vars?: string): string {
    return [path ? `/path=${path}` : '', vars ? `/vars=${vars}` : '', `/cts=${Date.now()}`, '/*'].join('');
}

export function send(path: string, data: object): void {
    const config = getConfig();

    if (!config.url) {
        return;
    }

    const payload = getPayload(path, createVarsString(data));

    const clck = `${config.url}/clck/click`;

    const sendBeaconPostAvailable = Boolean(navigator.sendBeacon);

    const sendBeaconResult = sendBeaconPostAvailable && navigator.sendBeacon(clck, payload);

    if (!sendBeaconResult) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', clck);
        xhr.send(payload);
    }
}
