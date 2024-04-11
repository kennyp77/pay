import { decodeMetadata } from '../_data/_shared/metadata';
import { loadPickupOptionDetails } from '../_data/pickup';
import { PickupOptionDetailsRequest, PickupOptionDetailsResponse } from '../typings';

export async function getPickupOptionDetails(
    payload: PickupOptionDetailsRequest,
): Promise<PickupOptionDetailsResponse> {
    const metadata = decodeMetadata(payload.metadata);

    const pickupOption = await loadPickupOptionDetails(
        payload.pickupPointId,
        metadata.pickup.value,
    );

    return { pickupOption };
}
