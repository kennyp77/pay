import { memo, useCallback } from 'react';
import * as React from 'react';

import { classnames } from '@bem-react/classnames';

export interface RangeProps {
    className?: string;
    name?: string;

    value?: number;
    min?: number;
    max?: number;
    onChange?(value: number): void;

    testId?: string;
}

export const Range: React.FC<RangeProps> = memo(function Range({
    className,
    name,
    value,
    min = 1,
    max = 100,
    onChange,
    testId,
}) {
    const change = useCallback((e) => onChange?.(e.target.value), [onChange]);

    return (
        <input
            className={classnames(
                'appearance-none',
                'rounded-full',
                'w-full',
                'h-2',
                'p-0',
                'bg-blue-gray-100',
                'dark:bg-blue-gray-1900',
                className,
            )}
            type="range"
            name={name}
            min={min}
            max={max}
            value={value}
            onChange={change}
            data-testid={testId && `${testId}-range`}
        />
    );
});
