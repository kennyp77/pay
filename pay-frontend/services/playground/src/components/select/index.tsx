import * as React from 'react';
import { useCallback } from 'react';

import { classnames } from '@bem-react/classnames';
import toString from '@tinkoff/utils/string/toString';

type Options = Array<{
    label: string;
    value: any;
}>;

export interface SelectProps<V> {
    className?: string;

    name?: string;
    value?: V;
    onChange?(value: V): void;

    options: Options;

    testId?: string;
}

const findValue = (options: Options, value: any) => {
    const option = options.find((item) => toString(item.value) === toString(value));

    return option ? option.value : value;
};

export function Select<V extends unknown = string | number>({
    className,
    name,
    options,
    value,
    onChange,
    testId,
}: SelectProps<V>) {
    const select = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange?.(findValue(options, e.target.value));
        },
        [onChange, options],
    );

    return (
        <select
            className={classnames(
                'px-3',
                'h-8',
                'w-2/3',
                'flex',
                'items-center',
                'rounded-lg',
                'bg-blue-gray-100',
                'dark:bg-blue-gray-1900',
                'text-body-long-m',
                className,
            )}
            name={name}
            value={value as string}
            onChange={select}
            data-testid={testId}
        >
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                    data-testid={testId && `${testId}-option`}
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
}
