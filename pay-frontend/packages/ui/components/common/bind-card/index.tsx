import React from 'react';

import { block } from 'bem-cn';

import './styles.css';

const b = block('bind-card');

interface BindCardProps {
    header: JSX.Element;
    content: JSX.Element;
    warning?: JSX.Element;
    footer?: JSX.Element;
    className?: string;
}

export default function BindCard({ header, content, warning, footer, className }: BindCardProps): JSX.Element {
    return (
        <div className={b.mix(className)}>
            <div className={b('header')}>{header}</div>
            <div className={b('content')}>{content}</div>
            {warning && <div className={b('warning')}>{warning}</div>}
            {footer && <div className={b('footer')}>{footer}</div>}
        </div>
    );
}
