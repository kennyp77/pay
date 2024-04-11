import { compose } from 'redux';

declare global {
    // eslint-disable-next-line no-redeclare
    const __DEV__: boolean;
    const __TEST__: boolean;

    interface Window {
        // eslint-disable-next-line no-undef
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;

        webkit?: any;
    }
}

export {};
