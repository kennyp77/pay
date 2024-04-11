import { memo, useCallback } from 'react';
import * as React from 'react';

import { classnames } from '@bem-react/classnames';

export interface ToggleProps {
    className?: string;
    name?: string;
    disabled?: boolean;

    checked?: boolean;
    onChange?(checked: boolean): void;

    testId?: string;
}

export const Toggle: React.FC<ToggleProps> = memo(function Toggle({
    className,
    name,
    checked,
    disabled,
    onChange,
    testId,
}) {
    const toggle = useCallback((e) => onChange?.(e.target.checked), [onChange]);

    return (
        <label
            className={classnames(
                'flex',
                'p-1',
                'w-10.5',
                'rounded-full',
                checked ? 'bg-yellow-700' : 'bg-blue-gray-100 dark:bg-blue-gray-1900',
                checked ? 'justify-end' : 'justify-start',
                disabled ? 'opacity-50' : '',
                className,
            )}
            data-testid={testId}
        >
            <input
                type="checkbox"
                className="hidden"
                name={name}
                disabled={disabled}
                checked={checked}
                onChange={toggle}
                data-testid={testId && `${testId}-checkbox`}
            />
            <span
                className={classnames('inline-block', 'w-4.5', 'h-4.5', 'bg-white', 'rounded-full')}
                data-testid={testId && `${testId}-switch`}
            />
        </label>
    );
});
