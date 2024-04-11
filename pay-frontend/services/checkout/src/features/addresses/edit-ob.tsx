import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { Path, history } from '../../router';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { AddressesEdit } from './edit';

interface AddressesEditObProps {
    addressId: string;
}

const i18n = (str: string) => str;

export function AddressesEditOb({ addressId }: AddressesEditObProps) {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { address, totalSteps } = useSelector(getObSteps);

    useEffectOnce(() => {
        setCurrentObStepFn(address.step);
    });

    const completeCallback = useCallback(async () => {
        history.push(address.completeHref);
    }, [address]);

    return (
        <AddressesEdit
            addressId={addressId}
            obHeader={
                <PanelHeaderOb
                    title={i18n('Редактировать адрес')}
                    backHref={Path.Addresses}
                    step={[address.step, totalSteps]}
                />
            }
            completeCallback={completeCallback}
            needsObFooter={address.step === 1}
        />
    );
}
