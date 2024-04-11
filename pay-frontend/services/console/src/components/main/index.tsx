import React, { useEffect } from 'react';

import { cn } from '@bem-react/classname';
import Icon from '@trust/ui/components/ui/icon';

import { Agreement } from '../agreement';
import { Policy } from '../policy';

import './styles.scss';

const cnMain = cn('Main');

export function MainContainer(): JSX.Element {
    return (
        <div className={cnMain()}>
            <div className={cnMain('Header')}>
                <div className={cnMain('Logo')}>
                    <Icon glyph="ya-pay-logo-with-accent" />
                </div>
            </div>

            <div className={cnMain('Content')}>
                <Policy />
            </div>

            <div className={cnMain('Footer')}>
                <Agreement />
            </div>
        </div>
    );
}
