type RemoveAndAddPlacemarks = {
    removePlacemarks: YMaps.GeoObject[];
    addPlacemarks: Checkout.MapPlacemark[];
};

export function getAddAndRemovePlacemarks(
    placemarks: YMaps.GeoObject[],
    mapPlacemarks: Checkout.MapPlacemark[],
): RemoveAndAddPlacemarks {
    const idsOnMap: string[] = [];
    const removePlacemarks: YMaps.GeoObject[] = [];
    const addPlacemarks: Checkout.MapPlacemark[] = [];

    placemarks.forEach((placemark) => {
        // @ts-ignore
        const placemarkId: string = placemark.properties.get('id', null);
        // @ts-ignore
        const placemarkCoordinates: Checkout.MapPoint = placemark.properties.get(
            'coordinates',
            // @ts-ignore
            null,
        );

        if (
            placemarkId &&
            placemarkCoordinates &&
            mapPlacemarks.find(
                ({ id, coordinates: { latitude, longitude } }) =>
                    id === placemarkId &&
                    placemarkCoordinates.latitude === latitude &&
                    placemarkCoordinates.longitude === longitude,
            )
        ) {
            idsOnMap.push(placemarkId);
        } else {
            removePlacemarks.push(placemark);
        }
    });

    for (const mapPlacemark of mapPlacemarks) {
        if (!idsOnMap.includes(mapPlacemark.id)) {
            addPlacemarks.push(mapPlacemark);
        }
    }

    return { removePlacemarks, addPlacemarks };
}
