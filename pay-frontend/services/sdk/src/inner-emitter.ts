import { EventEmitter } from '@trust/utils/event-emitter';

import { InnerEventType, PaymentUpdateEvent } from './typings';

interface InnerEventsMap {
    [InnerEventType.PaymentUpdate]: PaymentUpdateEvent;
}

export const innerEmitter = new EventEmitter<InnerEventsMap>();
