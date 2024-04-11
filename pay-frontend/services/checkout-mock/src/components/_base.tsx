import React from 'react';

import isEqual from '@tinkoff/utils/is/equal';
import isFunction from '@tinkoff/utils/is/function';
import path from '@tinkoff/utils/object/path';
import prop from '@tinkoff/utils/object/prop';

interface PanelProps {
    title: string;
    children: React.ReactNode;
    as?: React.ElementType;
}

export function Panel({ title, children, as }: PanelProps) {
    const Element = as || 'h3';

    return (
        <div>
            <Element>{title}</Element>
            <div>{children}</div>
        </div>
    );
}

interface ListProps<T extends Record<string, any>> {
    list: T[];
    render?: Array<Array<Sys.CallbackFn1<T> | string>>;
    active?: T | [keyof T, any];
    onSelect?: Sys.CallbackFn1<T>;
}

export function List<T>({ active, list, render, onSelect }: ListProps<T>) {
    const renderItem = (item: T) =>
        render
            ? render
                  .map((row) =>
                      row
                          .map((name) =>
                              isFunction(name) ? name(item) : path(name.split('.'), item),
                          )
                          .join(' '),
                  )
                  .join('\n')
            : item;

    const isActive = Array.isArray(active)
        ? (item: T) => isEqual(prop(active[0], item), active[1])
        : (item: T) => isEqual(item, active);

    const Element = onSelect ? 'button' : 'div';

    return (
        <div>
            {list.map((item, idx) => (
                <Element
                    key={idx}
                    style={{
                        margin: '0 5px 5px 0',
                        whiteSpace: 'pre-line',
                        fontWeight: isActive(item) ? 'bold' : 'normal',
                    }}
                    onClick={onSelect ? () => onSelect(item) : null}
                >
                    {renderItem(item)}
                </Element>
            ))}
        </div>
    );
}

export function Progress() {
    return <div>Обновление...</div>;
}
