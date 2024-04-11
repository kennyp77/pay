import { decodeMetadata } from '../_data/_shared/metadata';
import { loadPickupOptions } from '../_data/pickup';
import { PickupOptionsRequest, PickupOptionsResponse } from '../typings';

const HTTP_504_DELAY = 10 * 1000;

export async function getPickupOptions(
    payload: PickupOptionsRequest,
): Promise<PickupOptionsResponse> {
    const metadata = decodeMetadata(payload.metadata);

    const pickupOptions = await loadPickupOptions(payload.boundingBox, metadata.pickup.value);

    if (pickupOptions === null) {
        return new Promise((resolve) => setTimeout(resolve, HTTP_504_DELAY));
    }

    return { pickupOptions };
}
