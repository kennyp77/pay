import React, { ReactNode } from 'react';

export interface PanelHeaderObProps {
    title: ReactNode;
    step: Readonly<[number, number]>;
    backHref?: string;
}
