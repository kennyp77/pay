import { getOrigin } from '../url';

import { ANY_ORIGIN, ANY_CHANNEL } from './constants';
import { IConnectionMessage } from './types/connection-message';

export class ConnectionMessage<T> implements IConnectionMessage<T> {
    constructor(
        readonly payload: T,
        readonly channel: string = ANY_CHANNEL,
        readonly sourceUrl?: string,
    ) {}

    get origin(): string {
        if (this.sourceUrl) {
            return getOrigin(this.sourceUrl) || ANY_ORIGIN;
        }

        return ANY_ORIGIN;
    }

    toJSON(): Object {
        if (!this.sourceUrl) {
            return {
                payload: this.payload,
                channel: this.channel,
            };
        }

        return {
            payload: this.payload,
            channel: this.channel,
            sourceUrl: this.sourceUrl,
        };
    }

    toString(): string {
        return JSON.stringify(this);
    }
}
