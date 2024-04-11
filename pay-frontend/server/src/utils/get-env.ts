export function getEnv<S = string>(name: string, defaultValue?: S): S {
    const value = (process.env[name] || defaultValue) as S;

    if (typeof value === 'undefined') {
        throw new Error(`"${name}" environment variable is not found`);
    }

    return value;
}
