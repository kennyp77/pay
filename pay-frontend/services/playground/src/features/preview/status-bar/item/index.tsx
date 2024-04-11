import { memo } from 'react';
import * as React from 'react';

import { classnames } from '@bem-react/classnames';

import { LogRecord } from 'store/types';

interface StatusBarItemProps {
    event: LogRecord;
}

export const StatusBarItem = memo(function StatusBarItem({ event }: StatusBarItemProps) {
    return (
        <div
            className={classnames(
                'flex',
                'gap-2',
                'group',
                'cursor-default',
                'text-secondary',
                'hover:text-primary',
                'hover:dark:text-white',
            )}
        >
            <span className={classnames('w-32', 'font-mono', 'text-current')}>{event.sender}</span>
            <span className={classnames('w-32', 'font-mono', 'text-current')}>
                {event.receiver}
            </span>
            <span className={classnames('w-full', 'font-mono', 'text-current')}>
                {event.message}
            </span>
            <span
                className={classnames(
                    'w-16',
                    'font-mono',
                    'text-blue-900',
                    'text-right',
                    'group-hover:font-bold',
                )}
            >
                +{event.timestampDiff}
            </span>
        </div>
    );
});
