import React from 'react';

import block from 'bem-cn';

import PrimaryButton from '../primary-button';
import Icon from '../ui/icon';

import './styles.css';

const b = block('payment-status');

export enum PaymentStatusType {
    Success = 'SUCCESS',
    Failure = 'FAILURE',
}

interface PaymentStatusProps {
    type: PaymentStatusType;
    description?: string | JSX.Element;
    sessionId?: string;
    action?: () => void;
    actionText?: string;
}

const getIconGlyphByType = (type: PaymentStatusType): string | void => {
    switch (type) {
        case PaymentStatusType.Success:
            return 'payment-success';

        case PaymentStatusType.Failure:
            return 'payment-error';

        default:
            return undefined;
    }
};

export default function PaymentStatus({
    type,
    description,
    sessionId,
    action,
    actionText,
}: PaymentStatusProps): JSX.Element {
    const label = `payment-status--${type}`.toLowerCase();
    const iconGlyph = getIconGlyphByType(type);

    return (
        <div className={b()} data-label={label}>
            <div className={b('logo')}>
                <Icon className={b('logo-icon')} glyph="ya-pay-logo-with-accent" />
            </div>
            <div className={b('content')}>
                {iconGlyph && <Icon className={b('icon')} glyph={iconGlyph} />}
                <h4 className={b('message')}>{description}</h4>
            </div>
            {sessionId ? (
                <React.Fragment>
                    <span className={b('label-session-id')}>Для службы поддержки:</span>
                    <span className={b('session-id')}>{sessionId}</span>
                </React.Fragment>
            ) : null}
            {action ? (
                <div className={b('action')}>
                    <PrimaryButton title={actionText} onClick={action} />
                </div>
            ) : null}
        </div>
    );
}
