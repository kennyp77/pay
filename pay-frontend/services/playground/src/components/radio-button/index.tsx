import * as React from 'react';
import { useCallback } from 'react';

import { classnames } from '@bem-react/classnames';

export interface RadioButtonProps {
    className?: string;

    name?: string;
    value?: string | number;
    onChange?(value: string | number): void;

    options: Array<{
        label: string;
        value: any;
    }>;

    testId?: string;
}

export const RadioButton: React.FC<RadioButtonProps> = function RadioButton({
    className,
    name,
    options,
    value,
    onChange,
    testId,
}) {
    const select = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.value);
        },
        [onChange],
    );

    return (
        <div
            className={classnames(
                'p-1',
                'inline-flex',
                'items-center',
                'gap-1',
                'rounded-lg',
                'bg-blue-gray-100',
                'dark:bg-blue-gray-1900',
                className,
            )}
            data-testid={testId}
        >
            {options.map((option) => (
                <label
                    key={option.value}
                    className="contents"
                    data-testid={testId && `${testId}-label`}
                >
                    <input
                        type="radio"
                        className="hidden"
                        name={name}
                        checked={option.value === value}
                        value={option.value}
                        onChange={select}
                        data-testid={testId && `${testId}-input`}
                    />
                    <span
                        className={classnames(
                            'py-0.5',
                            'px-2',
                            'rounded-md',
                            'text-body-long-m',
                            value === option.value ? 'bg-white' : 'bg-transparent',
                            value === option.value ? 'text-primary' : 'text-secondary',
                        )}
                        data-testid={testId && `${testId}-caption`}
                    >
                        {option.label}
                    </span>
                </label>
            ))}
        </div>
    );
};
