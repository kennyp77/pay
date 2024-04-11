import { YaPay } from '.';

declare global {
    interface Window {
        YaPay?: YaPay;
    }
}
