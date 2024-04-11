import React from 'react';

import OrderInput from '../order-input';

interface OrderNameProps {
    name?: string;
    errorHint?: string;
    label?: string;
    onChange: (name: string) => void;
    onChangeValidState: (valid: boolean) => void;
}

// Максимальные длины имени и фамилии 50 символа
const NAME_PATTERN = /^[а-яА-ЯёЁ]{2,}(((\s[-()]?)|([-()]?\s)|([- ]))[а-яА-ЯёЁ]{2,}[()]?){1,4}$/i;
const INVALID_NAME_HINT = 'Напишите имя и фамилию как в паспорте';
const LABEL = 'Имя и фамилия плательщика';

export default function OrderName({
    name,
    onChange,
    onChangeValidState,
    errorHint = INVALID_NAME_HINT,
    label = LABEL,
}: OrderNameProps): JSX.Element {
    return (
        <OrderInput
            value={name}
            onChange={onChange}
            onChangeValidState={onChangeValidState}
            errorHint={errorHint}
            label={label}
            pattern={NAME_PATTERN}
        />
    );
}
