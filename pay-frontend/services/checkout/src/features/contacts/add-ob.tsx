import React, { useCallback } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { PanelHeaderOb } from '../../components/panel/header/onboarding@touch';
import { USER_FIRST_NAME, USER_EMAIL, USER_LAST_NAME } from '../../config';
import { history } from '../../router';
import { getObSteps, setCurrentObStep } from '../../store/app';

import { ContactsAdd } from './add';
import { initialValues } from './helpers/forms';

export function ContactsAddOb() {
    const setCurrentObStepFn = useService(setCurrentObStep);
    const { contact, totalSteps } = useSelector(getObSteps);

    let initialFormValues: undefined | Checkout.ContactFormData;

    if (contact.addFillForm) {
        initialFormValues = {
            ...initialValues,
            firstName: USER_FIRST_NAME,
            lastName: USER_LAST_NAME,
            email: USER_EMAIL,
        };
    }

    useEffectOnce(() => {
        setCurrentObStepFn(contact.step);
    });

    const completeCallback = useCallback(async () => {
        history.push(contact.completeHref);
    }, [contact]);

    return (
        <ContactsAdd
            obHeader={
                <PanelHeaderOb
                    title="Получатель"
                    backHref={contact.addPrevHref}
                    step={[contact.step, totalSteps]}
                />
            }
            completeCallback={completeCallback}
            initialFormValues={initialFormValues}
            needsObFooter={contact.step === 1}
        />
    );
}
