import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { history } from '../../router';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { PickupSelectedComponent } from '.';

const i18n = (v: string) => v;

export function PickupSelectedComponentOb() {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { address, totalSteps } = useSelector(getObSteps);

    useEffectOnce(() => {
        setCurrentObStepFn(address.step);
    });

    const completeCallback = useCallback(async () => {
        history.push(address.completeHref);
    }, [address]);

    return (
        <PickupSelectedComponent
            completeCallback={completeCallback}
            obHeader={
                <PanelHeaderOb
                    title={i18n('Самовывоз')}
                    backHref={address.addPrevHref}
                    step={[address.step, totalSteps]}
                />
            }
        />
    );
}
