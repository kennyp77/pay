// TODO i18n
import React from 'react';

import { PayMethodsIcon } from '@trust/ui/pay-icon';
import { block } from 'bem-cn';

import './styles.css';

const b = block('new-card');

export default function NewCard(): JSX.Element {
    // TODO i18n
    return (
        <div className={b()}>
            <span className={b('label')}>Оплата новой картой</span>
            <div className={b('meta')}>
                <PayMethodsIcon glyph="new-card" />
            </div>
        </div>
    );
}
