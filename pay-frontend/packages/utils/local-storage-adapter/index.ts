export class LocalStorageAdapter {
    static setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (unused) {
            /* nothing */
        }
    }

    static getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (unused) {
            return null;
        }
    }
}
