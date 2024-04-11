import { NativeTarget } from './types';

/**
 * Хэндлер который регистрируется в iOS Webview нативной обвязкой YandexPay
 * Имя согласовано с разработчиками YandexPay Mobile
 */
const IOS_NATIVE_HANDLER = 'checkoutEvents';

function getIOSTarget(): NativeTarget | undefined {
    if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers[IOS_NATIVE_HANDLER] &&
        typeof window.webkit.messageHandlers[IOS_NATIVE_HANDLER].postMessage === 'function'
    ) {
        return window.webkit.messageHandlers[IOS_NATIVE_HANDLER];
    }
}

export class ConnectionNative {
    static nativeTarget() {
        return getIOSTarget();
    }
}
