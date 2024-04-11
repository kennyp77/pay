import React from 'react';

import { block } from 'bem-cn';

import './styles.css';

const b = block('order');

interface OrderProps {
    active: boolean;
    header: JSX.Element;
    footer: JSX.Element;
    content: JSX.Element;
}

export default function Order({ active, header, footer, content }: OrderProps): JSX.Element {
    return (
        <div className={b({ active })}>
            <div className={b('header')}>{header}</div>
            <div className={b('content')}>{content}</div>
            <div className={b('footer')}>{footer}</div>
        </div>
    );
}
