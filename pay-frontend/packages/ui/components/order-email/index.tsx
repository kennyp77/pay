import React from 'react';

import OrderInput from '../order-input';

interface OrderEmailProps {
    email?: string;
    errorHint?: string;
    label?: string;
    onChange: (email: string) => void;
    onChangeValidState: (valid: boolean) => void;
}

// Максимальная длина до домена - 64 символа
const EMAIL_PATTERN = /^[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const INVALID_EMAIL_HINT = 'Неверный формат почты';
const LABEL = 'Почта для чека';

export default function OrderEmail({
    email,
    onChange,
    onChangeValidState,
    errorHint = INVALID_EMAIL_HINT,
    label = LABEL,
}: OrderEmailProps): JSX.Element {
    return (
        <OrderInput
            value={email}
            onChange={onChange}
            onChangeValidState={onChangeValidState}
            errorHint={errorHint}
            label={label}
            pattern={EMAIL_PATTERN}
        />
    );
}
