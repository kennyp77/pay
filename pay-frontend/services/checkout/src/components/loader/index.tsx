import React, { ReactNode } from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { Col } from '../../components/col';
import { Row } from '../../components/row';
import { Spin, SpinProps } from '../../components/spin';

import './styles.scss';

export const cnLoader = cn('Loader');

export interface LoaderProps extends IClassNameProps {
    children?: ReactNode;
    size: SpinProps['size'];
    position: 'center' | 'left';
    progress?: boolean;
    fill?: 'white' | 'grey';
}

export function Loader({ progress, fill, size, className, position, children }: LoaderProps) {
    if (!progress) {
        return null;
    }

    return (
        <Col className={cnLoader({ fill }, [className])} align="center">
            {position === 'left' ? (
                <Row align="center">
                    <Spin progress view="default" size={size} />

                    {children}
                </Row>
            ) : (
                <React.Fragment>
                    <Row shrink justify="center">
                        <Spin progress view="default" size={size} />
                    </Row>

                    {children}
                </React.Fragment>
            )}
        </Col>
    );
}
