import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import isNumber from '@tinkoff/utils/is/number';
import isPlainObject from '@tinkoff/utils/is/plainObject';
import isString from '@tinkoff/utils/is/string';
import { EventEmitter } from '@trust/utils/event-emitter';

function toObj(value: unknown): Record<string, string> {
    try {
        const data = isString(value) ? JSON.parse(value) : value;

        return isPlainObject(data) ? data : {};
    } catch (err) {
        return {};
    }
}

export enum SplitMessageType {
    Loaded = 'Loaded',
    Resize = 'Resize',
    Success = 'Success',
    Error = 'Error',
    Cancel = 'Cancel',
}

export enum SplitErrorType {
    Scoring = 'Scoring',
}

interface SplitMessageLoaded {
    status: SplitMessageType.Loaded;
}

interface SplitMessageResize {
    status: SplitMessageType.Resize;
    height: number;
}

interface SplitMessageSuccess {
    status: SplitMessageType.Success;
}

interface SplitMessageError {
    status: SplitMessageType.Error;
    reason: SplitErrorType;
}

interface SplitMessageCancel {
    status: SplitMessageType.Cancel;
}

type EventMap = {
    [SplitMessageType.Loaded]: SplitMessageLoaded;
    [SplitMessageType.Resize]: SplitMessageResize;
    [SplitMessageType.Success]: SplitMessageSuccess;
    [SplitMessageType.Error]: SplitMessageError;
    [SplitMessageType.Cancel]: SplitMessageCancel;
};

export class SplitConnection extends EventEmitter<EventMap> {
    static getInstance = memoizeOnce((): SplitConnection => {
        return new SplitConnection();
    });

    constructor() {
        super();

        window.addEventListener('message', this.onMessage);
    }

    private onMessage = (event: any): void => {
        // console.log('MESSAGE', event);
        const data = toObj(event.data);

        if (data.type === 'bnpl-loaded') {
            this.emit(SplitMessageType.Loaded, { status: SplitMessageType.Loaded });
        }

        if (data.type === 'bnpl-resize') {
            const height = Number(data.height);

            if (isNumber(height)) {
                this.emit(SplitMessageType.Resize, {
                    status: SplitMessageType.Resize,
                    height,
                });
            }
        }

        if (data.type === 'bnpl-payment-success') {
            this.emit(SplitMessageType.Success, { status: SplitMessageType.Success });
        }

        if (data.type === 'bnpl-payment-cancelled') {
            this.emit(SplitMessageType.Cancel, { status: SplitMessageType.Cancel });
        }

        if (data.type === 'bnpl-scoring-failed') {
            this.emit(SplitMessageType.Error, {
                status: SplitMessageType.Error,
                reason: SplitErrorType.Scoring,
            });
        }
    };
}
