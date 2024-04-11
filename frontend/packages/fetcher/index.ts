export function createInstance(baseUrl: string, defaults: RequestInit = Object.create(null)) {
    const closure = (url: string, options: RequestInit = defaults) => {
        const { method = 'GET' } = options;

        const headers = new Headers(options.headers);

        return fetch(`${baseUrl}${url}`, {
            ...options,
            method,
            headers,
        });
    };

    closure.post = function post(url: string, body: BodyInit) {
        const method = 'POST';
        const headers = new Headers(defaults.headers);
        headers.set('content-type', 'application/json');

        return closure(url, {
            method,
            body,
            headers,
        });
    };

    return closure;
}
