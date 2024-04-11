import React, { createRef, useCallback, useEffect, useMemo } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { Button } from '../../components/button';
import { Icon } from '../../components/icons';
import { Input } from '../../components/input';
import { Panel, PanelHeader } from '../../components/panel';
import { Row } from '../../components/row';
import { history, Path } from '../../router';
import {
    getCouponError,
    getCouponStatus,
    getCouponValue,
    resetCouponData,
    validateCoupon,
} from '../../store/coupon';

import successIcon from './assets/success.svg';

const TIMEOUT_TO_CLOSE = 1500;

const i18n = (v: string) => v;

const onComplete = () => history.push(Path.Main);
const completeCallbackDefault = () => setTimeout(onComplete, TIMEOUT_TO_CLOSE);

export const CouponForm = function CouponForm() {
    const inputRef = createRef<HTMLInputElement>();
    const couponValue = useSelector(getCouponValue);
    const couponStatus = useSelector(getCouponStatus);
    const couponError = useSelector(getCouponError);

    const isSuccess = useMemo(() => asyncData.isSuccess(couponStatus), [couponStatus]);
    const isPending = useMemo(() => asyncData.isPending(couponStatus), [couponStatus]);

    const validateCouponFn = useService(validateCoupon);

    useEffectOnce(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    });

    const validate = useCallback(() => {
        validateCouponFn(inputRef.current?.value || '', completeCallbackDefault);
    }, [inputRef, validateCouponFn]);

    return (
        <Panel
            header={<PanelHeader title={i18n('Новый промокод')} closeHref={Path.Main} />}
            footer={
                isSuccess ? (
                    <Button
                        width="max"
                        size="l"
                        view="action"
                        pin="round-m"
                        outline="success"
                        onClick={onComplete}
                    >
                        <Row align="center" justify="center">
                            <Icon svg={successIcon} size="m" />
                            <Row left="2xs" shrink />
                            {i18n('Промокод активирован')}
                        </Row>
                    </Button>
                ) : (
                    <Button
                        width="max"
                        size="l"
                        view="action"
                        variant="primary"
                        pin="round-m"
                        progress={isPending}
                        onClick={validate}
                    >
                        {i18n('Активировать')}
                    </Button>
                )
            }
        >
            <Input
                size="m"
                view="material"
                variant="filled"
                label={i18n('Введите промокод')}
                hint={couponError}
                state={couponError ? 'error' : undefined}
                value={couponValue}
                controlRef={inputRef}
            />
        </Panel>
    );
};
