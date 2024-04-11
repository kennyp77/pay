import React, { useMemo } from 'react';

import { PaymentCashback } from '@trust/utils/payment-methods/typings';
import { numberWord } from '@trust/utils/string';
import { block } from 'bem-cn';

import { PLUS_AGREEMENT_HREF } from '../constants';
import Amount from '../ui/amount';
import Icon from '../ui/icon';
import Link from '../ui/link';

import './styles.css';

const b = block('plus-cashback');

export default function PlusCashback({ amount }: PaymentCashback): JSX.Element {
    const cashbackAmountText = useMemo(() => {
        return numberWord(Number(amount), ['балл', 'балла', 'баллов']);
    }, [amount]);

    return (
        <div className={b()}>
            <div className={b('logo')}>
                <Icon glyph="plus-gradient" className={b('icon')} />
            </div>
            <div className={b('info')}>
                <div>После оплаты вам будет начислен кешбэк</div>
                <span className={b('plus-info')}>
                    <Amount amount={amount} currency="" />
                    <span> {cashbackAmountText} Плюса</span>
                    <span className={b('info-link')}>
                        <Link
                            inline
                            theme="grey"
                            href={PLUS_AGREEMENT_HREF}
                            // Открываем через window.open, иначе грузится страница в фрейме траста
                            onClick={(): void => {
                                window.open(PLUS_AGREEMENT_HREF, '_blank');
                            }}
                        >
                            <Icon glyph="question-mark" />
                        </Link>
                    </span>
                </span>
            </div>
        </div>
    );
}
