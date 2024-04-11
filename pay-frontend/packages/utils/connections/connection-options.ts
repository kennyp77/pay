import { getSource, getOrigin } from '../url';

import { ANY_ORIGIN, ANY_CHANNEL, DEFAULT_URL } from './constants';

export class ConnectionOptions {
    constructor(public targetUrl: string = DEFAULT_URL, public channel: string = ANY_CHANNEL) {}

    get targetOrigin(): string {
        return getOrigin(this.targetUrl) || ANY_ORIGIN;
    }

    get sourceUrl(): string {
        return getSource();
    }

    get sourceOrigin(): string {
        return getOrigin(this.sourceUrl) || ANY_ORIGIN;
    }

    get isInitialized(): boolean {
        return this.targetUrl !== DEFAULT_URL;
    }
}
