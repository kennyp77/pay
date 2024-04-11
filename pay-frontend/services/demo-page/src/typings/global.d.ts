import { YaPay } from '@yandex-pay/sdk/src/typings';

declare global {
    interface Window {
        YaPay?: YaPay;
    }
}
