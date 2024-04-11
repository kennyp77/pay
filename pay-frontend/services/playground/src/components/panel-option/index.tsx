import { memo } from 'react';
import * as React from 'react';

import { classnames } from '@bem-react/classnames';

export interface PanelOptionProps {
    label?: string;
    topLabel?: boolean;
    className?: string;
}

export const PanelOption: React.FC<PanelOptionProps> = memo(function PanelOption({
    className,
    label,
    topLabel,
    children,
}) {
    return (
        <div className={classnames('flex', 'justify-between', 'items-center', className)}>
            <span className={classnames('mr-2', topLabel ? 'self-start mt-0.5' : '')}>{label}</span>
            {children}
        </div>
    );
});
