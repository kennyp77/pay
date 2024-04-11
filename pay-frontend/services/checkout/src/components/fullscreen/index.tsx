import React from 'react';

import { cn } from '@bem-react/classname';
import { IClassNameProps } from '@bem-react/core';

import { Col } from '../col';

import './styles.scss';

const cnFullscreen = cn('Fullscreen');

type Background = 'white' | 'grey' | 'red' | 'red-light';

interface FullscreenProps extends IClassNameProps {
    bg?: Background;
    fixed?: boolean;
    fullHeight?: boolean;
}

export class Fullscreen extends React.PureComponent<FullscreenProps> {
    render() {
        const { bg, fixed, fullHeight, children, className } = this.props;

        const classes = cnFullscreen({ bg, fixed, fullHeight }, [
            'mh100',
            fixed ? 'h100' : '',
            className,
        ]);

        return <Col className={classes}>{children}</Col>;
    }
}
