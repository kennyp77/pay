export const generateString = (length: number): string =>
    Array(length)
        .fill('')
        .map(() => Math.random().toString(36).charAt(2))
        .join('');
