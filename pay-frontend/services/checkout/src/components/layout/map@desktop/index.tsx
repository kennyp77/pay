import React, { ReactNode } from 'react';

import { cn } from '@bem-react/classname';

import { Block } from '../../block';

import './styles.scss';

interface MapLayoutProps {
    children: ReactNode;
}

const cnMapLayout = cn('MapLayout');

export function MapLayout({ children }: MapLayoutProps) {
    return (
        <div className={cnMapLayout()}>
            <div className={cnMapLayout('Content', ['h100'])}>
                <Block bg="white" radius="xl" all="m" className={cnMapLayout('Block')}>
                    {children}
                </Block>
            </div>
        </div>
    );
}
