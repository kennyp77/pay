export {};

declare global {
    interface Window {
        __CONFIG: Record<string, string>;
    }
}
