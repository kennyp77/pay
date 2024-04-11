import React, { useCallback, useMemo, useState } from 'react';

import { useService } from '@yandex-pay/react-services';

import { Panel, PanelHeader } from 'components/panel';
import { BindingForm } from 'features/binding-form';
import { selectBindedCard } from 'store/payment-methods';

import { PaymentLoader } from '../components/payment-loader';

const i18n = (v: string) => v;

enum Step {
    FormBindingLoading,
    FormBindingFilling,
    FormBindingSubmitting,
    FormAuthenticationFilling,
    FormAuthenticationSubmitting,
}

interface AddCardProps {
    steps?: [number, number];
    onSuccess: Sys.CallbackFn0;
    onError: Sys.CallbackFn1<string>;
    onCancel: Sys.CallbackFn0;
}

export function AddCard({ steps, onSuccess, onError, onCancel }: AddCardProps): JSX.Element {
    const [formVisible, setFormVisible] = useState(false);
    const [step, setStep] = useState<Step>(Step.FormBindingLoading);

    const selectBindedCardFn = useService(selectBindedCard);

    const loaderMessage = useMemo(() => {
        if (step === Step.FormBindingLoading) {
            return i18n('Добавление карты для оплаты');
        }

        if (step === Step.FormBindingSubmitting) {
            return i18n('Проверяем карту...');
        }

        return '';
    }, [step]);

    const onReady = useCallback(() => {
        setStep(Step.FormBindingFilling);
    }, []);

    const onSubmit = useCallback(() => {
        setStep(Step.FormBindingSubmitting);
    }, []);

    const onAuthStart = useCallback(() => {
        setStep(Step.FormAuthenticationFilling);
    }, []);

    const onAuthEnd = useCallback(() => {
        setStep(Step.FormAuthenticationSubmitting);
    }, []);

    const onBindSuccess = useCallback(
        (trustCardId: string) => {
            selectBindedCardFn(trustCardId, onSuccess);
        },
        [selectBindedCardFn, onSuccess],
    );

    const onBindError = useCallback(() => {
        onError(i18n('Ошибка при привязке карты'));
    }, [onError]);

    return (
        <Panel
            header={<PanelHeader title={i18n('Добавление новой карты')} closeAction={onCancel} />}
        >
            <BindingForm
                onVisibilityChange={setFormVisible}
                onReady={onReady}
                onSubmit={onSubmit}
                onAuthStart={onAuthStart}
                onAuthEnd={onAuthEnd}
                onSuccess={onBindSuccess}
                onError={onBindError}
            />

            <PaymentLoader
                progress={!formVisible}
                title={
                    steps ? i18n(`Шаг ${steps[0]} из ${steps[1]}`) : i18n('Пожалуйста подождите')
                }
                message={loaderMessage}
            />
        </Panel>
    );
}
