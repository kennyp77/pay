export const readableValues = <R>(
    dictionary: { [Q in keyof R]?: string },
    object?: { [Q in keyof R]: any },
    fields?: (keyof R)[],
): [] => {
    if (!object) {
        return [];
    }

    return Object.entries(object).reduce((result, [key, value]) => {
        // @ts-ignore
        if (value && (!fields?.length || fields.includes(key))) {
            // @ts-ignore
            result.push(`${dictionary[key] ? `${dictionary[key]} ` : ''}${value}`);
        }

        return result;
    }, []);
};
