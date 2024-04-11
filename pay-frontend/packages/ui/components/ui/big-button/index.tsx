import React from 'react';

import { Button } from '@yandex-lego/components/Button/Button';
import { block } from 'bem-cn';

import './styles.css';

const b = block('big-button');

type BigButtonType = 'red' | 'white';
type ButtonProps = React.ComponentProps<typeof Button>;
type BigButtonProps = ButtonProps & {
    type?: BigButtonType;
};

export default function BigButton({
    className,
    type = 'red',
    disabled = false,
    ...props
}: BigButtonProps): JSX.Element {
    return (
        <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            className={b({ type, disabled }).mix(className).toString()}
            disabled={disabled}
        />
    );
}
