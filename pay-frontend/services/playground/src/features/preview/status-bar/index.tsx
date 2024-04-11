import * as React from 'react';

import { classnames } from '@bem-react/classnames';

import { Collapse } from 'components/collapse';
import { useLogRecords } from 'hooks/use-log';

import { StatusBarItem } from './item';

export function StatusBar() {
    const records = useLogRecords();

    return (
        <Collapse caption={'LOG'}>
            <div className={classnames('flex', 'flex-col', 'gap-1.5')}>
                {records.map((record) => (
                    <StatusBarItem key={record.timestamp?.getTime()} event={record} />
                ))}
            </div>
        </Collapse>
    );
}
