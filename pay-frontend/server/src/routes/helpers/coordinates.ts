type Coordinates = {
    latitude: string;
    longitude: string;
}

export function getCoordinates(query: Record<string, any>): Coordinates | undefined {
    const { latitude, longitude } = query;
    const coordsRegex = /^-?[0-9]+?(\.[0-9]+?)?$/;

    return coordsRegex.test(latitude) && coordsRegex.test(longitude)
        ? { latitude, longitude }
        : undefined;
}
