import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import './styles.scss';

const cnPanelWrapper = cn('PanelWrapper');

interface PanelWrapperProps extends IClassNameProps {
    children: React.ReactNode;
}

export function PanelWrapper({ children, className }: PanelWrapperProps) {
    return <div className={cnPanelWrapper(null, [className])}>{children}</div>;
}
