import React from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import {
    PaymentStageType,
    getPaymentStage,
    failPaymentService,
    startPaymentService,
    showPaymentInfoService,
    sendPaymentDataService,
    resetPaymentService,
    completePaymentService,
    setPaymentScreenService,
} from 'store/checkout';

import { PaymentModal } from './components/payment-modal';
import { AddCard } from './modules/add-card';
import { PaymentAuth3ds } from './modules/auth-3ds';
import { PaymentAuthYa } from './modules/auth-ya';
import { PaymentFailed } from './modules/failed';
import { PaymentProcess } from './modules/process';
import { SplitPayment } from './modules/split-payment';
import { PaymentSuccessInfo } from './modules/success-info';
import { PaymentSuccessRedirect } from './modules/success-redirect';

interface PaymentProps {
    touch: boolean;
}

export function Payment({ touch }: PaymentProps) {
    const stage = useSelector(getPaymentStage);
    const startPayment = useService(startPaymentService);
    const setPaymentScreen = useService(setPaymentScreenService);
    const resetPayment = useService(resetPaymentService);
    const showPaymentInfo = useService(showPaymentInfoService);
    const sendPaymentData = useService(sendPaymentDataService);
    const completePayment = useService(completePaymentService);
    const failPayment = useService(failPaymentService);

    if (stage.type === PaymentStageType.Initial) {
        return null;
    }

    return (
        <PaymentModal touch={touch}>
            {stage.type === PaymentStageType.NewCard ? (
                <AddCard onSuccess={startPayment} onCancel={resetPayment} onError={failPayment} />
            ) : null}

            {stage.type === PaymentStageType.Payment ? <PaymentProcess /> : null}

            {stage.type === PaymentStageType.AuthYa ? (
                <PaymentAuthYa redirectUrl={stage.challengePath} />
            ) : null}

            {stage.type === PaymentStageType.Auth3ds ? (
                <PaymentAuth3ds
                    authFrameUrl={stage.auth3ds.url}
                    onComplete={setPaymentScreen}
                    onCancel={resetPayment}
                />
            ) : null}

            {stage.type === PaymentStageType.SplitPayment ? (
                <SplitPayment
                    splitFrameUrl={stage.splitFrameUrl}
                    onSuccess={showPaymentInfo}
                    onError={failPayment}
                    onCancel={resetPayment}
                />
            ) : null}

            {stage.type === PaymentStageType.SuccessInfo ? (
                <PaymentSuccessInfo onComplete={completePayment} />
            ) : null}

            {stage.type === PaymentStageType.SuccessRedirect ? (
                <PaymentSuccessRedirect onComplete={sendPaymentData} />
            ) : null}

            {stage.type === PaymentStageType.Failed ? (
                <PaymentFailed reason={stage.reason} action={stage.action} onClose={resetPayment} />
            ) : null}
        </PaymentModal>
    );
}
