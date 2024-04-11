import React from 'react';

import { Button } from '@yandex-lego/components/Button/desktop/bundle';
import { Spin } from '@yandex-lego/components/Spin/desktop/bundle';
import { Text } from '@yandex-lego/components/Text/desktop/bundle';
import { block } from 'bem-cn';

import DisabledIcon from './img/payment-disabled.svg';
import ErrorIcon from './img/payment-error.svg';
import SuccessIcon from './img/payment-success.svg';
import './index.css';

interface PaymentStatusProps {
    status: string;
    onClose: () => void;
}

const b = block('payment-status');

function Icon({ icon }: { icon: any }): JSX.Element {
    return (
        <svg viewBox={icon.viewBox} xmlns="http://www.w3.org/2000/svg">
            <use xlinkHref={`#${icon.id}`} />
        </svg>
    );
}

const ICON_MAP: any = {
    init: <Spin progress view="default" size="xs" />,
    progress: <Spin progress view="default" size="xs" />,
    success: <Icon icon={SuccessIcon} />,
    error: <Icon icon={ErrorIcon} />,
    disabled: <Icon icon={DisabledIcon} />,
};

const MESSAGE_MAP: any = {
    progress: 'Производится оплата...',
    success: 'Платеж успешно проведен',
    error: 'Произошла ошибка',
    disabled: 'Оплата недоступна',
};

export function PaymentStatus({ status, onClose }: PaymentStatusProps): JSX.Element {
    if (!status) {
        return null;
    }

    const icon = ICON_MAP[status] || null;
    const message = MESSAGE_MAP[status];

    return (
        <div className={b({ [status]: true })}>
            <div className={b('content')}>
                <div className={b('icon')}>{icon}</div>

                {message && (
                    <div className={b('message')}>
                        {['error', 'success', 'disabled'].includes(status) ? (
                            <Text
                                typography="headline-m"
                                weight="medium"
                                color={status === 'disabled' ? 'secondary' : null}
                            >
                                {message}
                            </Text>
                        ) : (
                            <Text typography="headline-s" weight="regular" color="secondary">
                                {message}
                            </Text>
                        )}
                    </div>
                )}

                {status === 'error' || status === 'success' ? (
                    <div className={b('button')}>
                        <Button view="default" size="s" onClick={onClose}>
                            Повторить
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
