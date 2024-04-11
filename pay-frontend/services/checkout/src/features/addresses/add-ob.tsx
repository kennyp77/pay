import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { history } from '../../router';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { AddressesAdd } from './add';

const i18n = (str: string) => str;

export function AddressesAddOb() {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { address, totalSteps } = useSelector(getObSteps);

    useEffectOnce(() => {
        setCurrentObStepFn(address.step);
    });

    const completeCallback = useCallback(async () => {
        history.push(address.completeHref);
    }, [address]);

    return (
        <AddressesAdd
            obHeader={
                <PanelHeaderOb
                    title={i18n(address.addPrevHref ? 'Новый адрес' : 'Доставка')}
                    backHref={address.addPrevHref}
                    step={[address.step, totalSteps]}
                />
            }
            completeCallback={completeCallback}
            needsObFooter={address.step === 1}
        />
    );
}
