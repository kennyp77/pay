import * as React from 'react';
import { memo } from 'react';

import { classnames } from '@bem-react/classnames';

export interface ButtonProps {
    className?: string;

    onClick?(e: React.MouseEvent<HTMLButtonElement>): void;
}

export const Button: React.FC<ButtonProps> = memo(function Button({
    className,
    children,
    onClick,
}) {
    return (
        <button
            className={classnames(
                'py-1.5',
                'px-3',
                'flex',
                'rounded-lg',
                'bg-blue-gray-100',
                'dark:bg-blue-gray-1900',
                'text-body-long-m',
                'font-medium',
                className,
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
});
