import React from 'react';

import { cn } from '@bem-react/classname';

import { DrawerLayout } from 'components/layout/drawer@touch';
import { ModalLayout } from 'components/layout/modal@desktop';

import './index.scss';

export const cnPaymentModal = cn('PaymentModal');

interface PaymentModalProps {
    touch: boolean;
    children: React.ReactNode;
}
export const PaymentModal = ({ touch, children }: PaymentModalProps) => {
    if (touch) {
        return <DrawerLayout className={cnPaymentModal()}>{children}</DrawerLayout>;
    }

    return (
        <ModalLayout width="auto" className={cnPaymentModal()}>
            {children}
        </ModalLayout>
    );
};
