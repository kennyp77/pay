import React from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { Pickup } from './pickup';

export function PickupOb() {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { address, totalSteps } = useSelector(getObSteps);

    useEffectOnce(() => {
        setCurrentObStepFn(address.step);
    });

    return (
        <Pickup obHeader={<PanelHeaderOb title="Доставка" step={[address.step, totalSteps]} />} />
    );
}
