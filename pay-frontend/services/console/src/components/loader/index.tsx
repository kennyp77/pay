import React from 'react';

import { cn } from '@bem-react/classname';

import { Spin } from '../spin';

import './styles.scss';

const cnLoader = cn('Loader');

interface LoaderProps {
    visible: boolean;
    className?: string;
}

export function Loader({ visible, className }: LoaderProps): JSX.Element {
    if (!visible) {
        return null;
    }

    return (
        <div className={cnLoader({}, [className])}>
            <Spin size="m" view="default" progress={true} />
        </div>
    );
}
