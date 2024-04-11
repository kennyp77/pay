const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(size: number = 6): string {
    let result = '';

    for (let i = 0; i < size; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return result;
}
