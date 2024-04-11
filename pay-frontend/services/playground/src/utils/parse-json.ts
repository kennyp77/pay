export function parseJson<T>(data: string, def: T): T {
    try {
        return JSON.parse(data);
    } catch (err) {
        console.warn(err);

        return def;
    }
}
