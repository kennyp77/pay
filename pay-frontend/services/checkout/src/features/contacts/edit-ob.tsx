import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { Path, history } from '../../router';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { ContactsEdit } from './edit';

interface ContactsEditObProps {
    contactId: string;
}

export function ContactsEditOb({ contactId }: ContactsEditObProps) {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { contact, totalSteps } = useSelector(getObSteps);

    useEffectOnce(() => {
        setCurrentObStepFn(contact.step);
    });

    const completeCallback = useCallback(async () => {
        history.push(contact.completeHref);
    }, [contact]);

    return (
        <ContactsEdit
            contactId={contactId}
            obHeader={
                <PanelHeaderOb
                    title="Изменить данные"
                    backHref={Path.Contacts}
                    step={[contact.step, totalSteps]}
                />
            }
            completeCallback={completeCallback}
            needsObFooter={contact.step === 1}
        />
    );
}
