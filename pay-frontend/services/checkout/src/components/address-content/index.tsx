import React, { memo, useMemo } from 'react';

import { Text } from '../../components/text';
import {
    getReadableAddress,
    READABLE_ADDRESS_TYPE,
    getReadableAddressAdditional,
} from '../../helpers/adresses';

const i18n = (v: string) => v;

interface AddressContentProps {
    address: Checkout.Address;
}

export const AddressContent = memo(({ address }: AddressContentProps) => {
    const readableAddress = useMemo(() => getReadableAddress(address), [address]);
    const addressAdditionals = useMemo(() => getReadableAddressAdditional(address), [address]);
    const hasAdditionalsLine = addressAdditionals || address.comment;

    return (
        <React.Fragment>
            <Text variant="m">
                {READABLE_ADDRESS_TYPE[address.type] && (
                    <b>
                        {i18n(READABLE_ADDRESS_TYPE[address.type])}
                        {'. '}
                    </b>
                )}
                <span>{readableAddress}</span>
            </Text>

            {hasAdditionalsLine && (
                <Text color="grey" variant="s" top="2xs">
                    {addressAdditionals && (
                        <React.Fragment>
                            <span>{addressAdditionals}</span>
                            <br />
                        </React.Fragment>
                    )}
                    {address.comment && <span>{address.comment}</span>}
                </Text>
            )}
        </React.Fragment>
    );
});
