export const random = (len = 5): string =>
    Math.random()
        .toString(16)
        .slice(2, 2 + len);
