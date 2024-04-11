export function parseJson<T = any>(data: string, def?: T): T {
    try {
        return JSON.parse(data);
    } catch (err) {
        return def;
    }
}
