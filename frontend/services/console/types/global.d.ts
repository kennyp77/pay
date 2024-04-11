import { compose } from 'redux';

import type { Logger } from '@yandex-int/yandex-logger';

declare global {
    namespace Express {
        export interface Request {
            nonce: string;
            logger: Logger;
        }
    }

    const __DEV__: boolean;
    const __TEST__: boolean;
    const __PROD__: boolean;

    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}
