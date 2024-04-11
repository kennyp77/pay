import React, { useState, useCallback } from 'react';

type LogMessage = any;

interface ResultContext {
    logs: LogMessage[];
    startTime: number;

    append: Sys.CallbackFn1<LogMessage>;
    reset: Sys.CallbackFn0;
    start: Sys.CallbackFn0;
}

const InitialContext: ResultContext = {
    logs: [],
    startTime: 0,
    start: () => undefined,
    append: () => undefined,
    reset: () => undefined,
};

export const resultContext = React.createContext<ResultContext>(InitialContext);

export function ResultContextProvider({ children }: { children: JSX.Element }): JSX.Element {
    const [logs, setLogs] = useState(InitialContext.logs);
    const [startTime, setStartTime] = useState(0);

    const start = useCallback(() => {
        setStartTime(Date.now());
    }, []);

    const append = useCallback((message: LogMessage) => {
        setLogs((prevLogs: LogMessage[]) =>
            prevLogs.concat({
                ...message,
                date: new Date(),
            }),
        );
    }, []);

    const reset = useCallback(() => {
        setLogs([]);
    }, []);

    return React.createElement(
        resultContext.Provider,
        {
            value: { logs, startTime, append, reset, start },
        },
        children,
    );
}
