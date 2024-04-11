import React from 'react';

import { Panel } from 'components/panel';

import { PaymentLoader } from '../components/payment-loader';

interface PaymentServerProps {
    steps?: [number, number];
}

const i18n = (v: string) => v;

export const PaymentProcess = ({ steps }: PaymentServerProps) => {
    return (
        <Panel>
            <PaymentLoader
                progress
                title={
                    steps ? i18n(`Шаг ${steps[0]} из ${steps[1]}`) : i18n('Пожалуйста подождите')
                }
                message={i18n('Происходит оплата...')}
            />
        </Panel>
    );
};
