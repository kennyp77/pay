import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');

export function resolve(_path: string): string {
    return path.resolve(ROOT_DIR, _path);
}

export function resolveRoute(_path: string): string {
    return resolve(`routes/${_path}`);
}
