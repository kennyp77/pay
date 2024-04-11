import { useCallback, useState } from 'react';
import * as React from 'react';

import { classnames } from '@bem-react/classnames';

import { Icon } from 'components/icon';

export interface CollapseProps {
    caption?: React.ReactNode;
    defaultOpen?: boolean;

    testId?: string;
}

export const Collapse: React.FC<CollapseProps> = function Collapse({
    caption,
    children,
    defaultOpen,
    testId,
}) {
    const [isOpen, setIsOpen] = useState<boolean>(defaultOpen || false);

    const toggle = useCallback(() => {
        setIsOpen((prevState) => !prevState);
    }, []);

    return (
        <section
            className={classnames(
                'flex',
                'flex-col',
                'bg-white',
                'dark:bg-blue-gray-1800',
                'rounded-xl',
            )}
            data-testid={testId}
        >
            <h3
                className={classnames(
                    'p-4',
                    'flex',
                    'items-center',
                    'justify-between',
                    'cursor-pointer',
                    isOpen ? 'text-current' : 'text-secondary dark:blue-gray-100',
                )}
                onClick={toggle}
                data-testid={testId && `${testId}-header`}
            >
                <span
                    className={classnames(
                        'text-current',
                        'text-body-long-m',
                        'leading-4',
                        'font-medium',
                    )}
                    data-testid={testId && `${testId}-caption`}
                >
                    {caption}
                </span>
                <Icon type={isOpen ? 'chevronUp' : 'chevronDown'} />
            </h3>
            <div
                className={classnames(
                    'p-4',
                    'pt-2',
                    'text-body-short-m',
                    isOpen ? 'block' : 'hidden',
                )}
                data-testid={testId && `${testId}-content`}
            >
                <div className={classnames('flex', 'flex-col', 'gap-4')}>{children}</div>
            </div>
        </section>
    );
};
