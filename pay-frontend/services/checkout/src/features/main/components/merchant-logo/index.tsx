import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { Icon, SvgIcon } from '../../../../components/icons';
import { Row, RowProps } from '../../../../components/row';
import { Text } from '../../../../components/text';
import { getMerchantId } from '../../../../store/payment';

import BrandshopLogo from './assets/brandshop.svg';
import HolodilnikLogo from './assets/holodilnik.svg';

const i18n = (v: string) => v;

const BrandshopIds = [
    '1a5f80a0-93e4-43ee-8996-b7aea5053c88', // PROD
    'a751322c-bd3b-4133-b823-ed460f6440fb', // TEST
    'ec6e91b2-efbc-4894-9422-a2bf73e8714a', // TEST BOLT
];

const HolodilnikIds = [
    'b1d9ef19-47a2-4a2b-a01e-c5f88fd1554e', // PROD
    '1003b7ce-f225-4675-bf4e-e49c3ac5747c', // TEST
];

if (__DEV__) {
    BrandshopIds.push(
        '7b1694c8-fc12-45dd-9b76-7b846c29d195',
        '40ce6632-ffaf-419d-a2a2-30effd1b2e2a', // BOLT::ruslankunaev
        '25c1d927-6a8a-4e58-a73d-4a72c0e4ff20', // BOLT::stepler
    );
    HolodilnikIds.push('c1069d7a-0e0d-4251-9ba0-aa763a13b4f9');
}

const getMerchantIdToLogo = (ids: string[], logo: SvgIcon) =>
    ids.reduce((idsObject, id) => ({ ...idsObject, [id]: logo }), {});

const MERCHANT_ID_TO_LOGO: Record<string, SvgIcon> = {
    ...getMerchantIdToLogo(BrandshopIds, BrandshopLogo),
    ...getMerchantIdToLogo(HolodilnikIds, HolodilnikLogo),
};

export function MerchantLogo(props: RowProps): JSX.Element | null {
    const merchantId = useSelector(getMerchantId);

    const icon = useMemo(() => MERCHANT_ID_TO_LOGO[merchantId], [merchantId]);

    const isBrandshop = useMemo(() => BrandshopIds.includes(merchantId), [merchantId]);

    if (!icon) {
        return null;
    }

    return (
        <Row {...props}>
            <Icon svg={icon} />
            {isBrandshop ? (
                <Text left="s" inline variant="s" color="grey">
                    {i18n('Магазин брендовой одежды,')}
                    <br />
                    {i18n('обуви и аксессуаров')}
                </Text>
            ) : null}
        </Row>
    );
}
