import * as React from 'react';

import { classnames } from '@bem-react/classnames';

export interface PanelProps {
    caption?: React.ReactNode;
    panelTheme?: 'dark' | 'light';
}
export const Panel: React.FC<PanelProps> = function Panel({ caption, children, panelTheme }) {
    let panelThemeTokens;
    if (panelTheme === 'dark') {
        panelThemeTokens = ['bg-blue-gray-1800', 'text-white'];
    } else if (panelTheme === 'light') {
        panelThemeTokens = ['bg-white', 'text-black'];
    } else {
        panelThemeTokens = ['bg-white', 'dark:bg-blue-gray-1800'];
    }

    return (
        <section
            className={classnames('flex', 'flex-col', ...panelThemeTokens, 'rounded-xl', 'h-min')}
        >
            {caption ? (
                <h3
                    className={classnames(
                        'p-4',
                        'text-current',
                        'text-body-long-m',
                        'leading-4',
                        'font-medium',
                    )}
                >
                    {caption}
                </h3>
            ) : null}
            <div className={classnames('p-4', 'pt-2', 'text-body-short-m', 'block')}>
                <div className={classnames('flex', 'flex-col', 'gap-4')}>{children}</div>
            </div>
        </section>
    );
};
