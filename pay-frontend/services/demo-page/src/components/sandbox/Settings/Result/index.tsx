import React, { useContext } from 'react';

import { block } from 'bem-cn';

import { resultContext } from '../../../../store/result';

import './index.css';

const b = block('logs');

const formatLogs = (logs: any[]): string => {
    const messages = logs.map(({ date, event, error }) =>
        [
            `Time: ${date.toLocaleTimeString()}`,
            error ? `Error: ${error.message}` : `Event: ${JSON.stringify(event, null, 2)}`,
        ].join('\n'),
    );

    return messages.join('\n\n----\n\n');
};

export function Result(): JSX.Element {
    const resultCtx = useContext(resultContext);

    return (
        <div className={b()}>
            <div className={b('content')}>{formatLogs(resultCtx.logs)}</div>
        </div>
    );
}
