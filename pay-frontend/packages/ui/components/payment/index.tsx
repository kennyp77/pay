import React from 'react';

import { block } from 'bem-cn';

import './styles.css';

interface PaymentProps {
    screen: string;
    footer: JSX.Element;
    content: JSX.Element;
    preloader: JSX.Element;
}

const b = block('payment');

export default function Payment({ screen, footer, content, preloader }: PaymentProps): JSX.Element {
    const screenIdentifier = String(screen).toLowerCase();
    const hasPreloader = Boolean(preloader);

    return (
        <div className={b({ screen: screenIdentifier, preloader: hasPreloader })}>
            <div className={b('card')}>
                <div className={b('preloader')}>{preloader}</div>
                <div className={b('content')}>{content}</div>
            </div>
            <div className={b('footer')}>{footer}</div>
        </div>
    );
}
