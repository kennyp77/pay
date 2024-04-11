import React from 'react';

import { ButtonContextProvider } from './button';
import { ResultContextProvider } from './result';
import { ScenarioContextProvider } from './scenario';
import { TestSettingsProvider } from './test-settings';

export function Store({ children }: { children: JSX.Element }): JSX.Element {
    return (
        <TestSettingsProvider>
            <ScenarioContextProvider>
                <ButtonContextProvider>
                    <ResultContextProvider>{children}</ResultContextProvider>
                </ButtonContextProvider>
            </ScenarioContextProvider>
        </TestSettingsProvider>
    );
}
