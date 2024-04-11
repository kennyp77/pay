import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { ObDisclaimerText } from '../ob-disclaimer-text';

import './styles.scss';

export * from './header';

const cnPanel = cn('Panel');

interface PanelProps extends IClassNameProps {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    needsObFooter?: boolean;
}

export function Panel({ children, footer, header, className, needsObFooter = false }: PanelProps) {
    return (
        <div className={cnPanel(null, [className])}>
            {header ? <div className={cnPanel('Header')}>{header}</div> : null}
            <div className={cnPanel('Body')}>
                <div className={cnPanel('InnerBody')}>
                    <div className={cnPanel('Content')}>{children}</div>
                </div>
            </div>
            {footer ? (
                <div className={cnPanel('Footer')}>
                    {footer}
                    {needsObFooter ? <ObDisclaimerText /> : null}
                </div>
            ) : null}
        </div>
    );
}
