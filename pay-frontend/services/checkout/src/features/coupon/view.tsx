import React, { useCallback } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Block } from '../../components/block';
import { Box } from '../../components/box';
import { Button } from '../../components/button';
import { Col } from '../../components/col';
import { Panel, PanelHeader } from '../../components/panel';
import { Row } from '../../components/row';
import { Text } from '../../components/text';
import { history, Path } from '../../router';
import {
    getRemoveCouponStatus,
    getSelectedCoupon,
    isCouponActivated,
    removeCoupon,
    resetCouponData,
} from '../../store/coupon';

const i18n = (v: string) => v;

export const CouponView = function CouponForm() {
    const couponValue = useSelector(getSelectedCoupon);
    const couponActivated = useSelector(isCouponActivated);
    const removeCouponStatus = useSelector(getRemoveCouponStatus);
    const resetCouponDataFn = useService(resetCouponData);

    const removeCouponFn = useService(removeCoupon);

    const onRemove = useCallback(() => {
        removeCouponFn();
    }, [removeCouponFn]);

    const onAddNew = useCallback(() => {
        resetCouponDataFn();
        history.push(Path.Coupon);
    }, [resetCouponDataFn]);

    if (!couponActivated) {
        return null;
    }

    return (
        <Panel header={<PanelHeader title={i18n('Промокод')} closeHref={Path.Main} />}>
            <Col>
                <Block radius="m" bg="green-light" bottom="l">
                    <Box top="2xl" bottom="2xl">
                        <Text align="center" variant="header-l" bottom="2xs">
                            {couponValue}
                        </Text>
                        <Text align="center" weight="bold" color="green">
                            {i18n('Активирован')}
                        </Text>
                    </Box>
                </Block>

                <Button
                    width="max"
                    onClick={onRemove}
                    view="action"
                    size="l"
                    pin="round-m"
                    outline="primary"
                    progress={asyncData.isPending(removeCouponStatus)}
                >
                    {i18n('Удалить промокод')}
                </Button>

                <Row top="s" />

                <Button width="max" onClick={onAddNew} view="default" size="l" pin="round-m">
                    {i18n('Ввести новый промокод')}
                </Button>
            </Col>
        </Panel>
    );
};
