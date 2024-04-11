import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { history } from '../../router';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { Contacts } from '.';

export function ContactsOb() {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { contact, totalSteps } = useSelector(getObSteps);

    useEffectOnce(() => {
        setCurrentObStepFn(contact.step);
    });

    const completeCallback = useCallback(async () => {
        history.push(contact.completeHref);
    }, [contact]);

    return (
        <Contacts
            obHeader={
                <PanelHeaderOb
                    title="Получатель"
                    backHref={contact.prevHref}
                    step={[contact.step, totalSteps]}
                />
            }
            completeCallback={completeCallback}
            needsObFooter={contact.step === 1}
        />
    );
}
