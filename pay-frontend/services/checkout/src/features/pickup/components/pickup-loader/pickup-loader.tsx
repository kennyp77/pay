import * as React from 'react';

import { cn } from '@bem-react/classname';

import { Row } from '../../../../components/row';

import './pickup-loader.scss';

export interface LoaderProps {
    className?: string;
}

const cnLoader = cn('pickup-loader');

export const PickupLoader: React.FC<LoaderProps> = function Loader({ className }) {
    return (
        <Row className={cnLoader('container')} align="center" justify="center">
            <div className={cnLoader({}, [className])}>
                <span />
            </div>
        </Row>
    );
};
