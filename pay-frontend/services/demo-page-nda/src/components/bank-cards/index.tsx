import React, { useEffect } from 'react';

import { TEMPLATE_CLASSNAME, THEME_CLASSNAME } from '@trust/ui/components/constants';
import PaymentMethodDetails from '@trust/ui/components/payment-method-details';
import { dom } from '@trust/utils/dom';
import { Text } from '@yandex-lego/components/Text/desktop/bundle';
import { block } from 'bem-cn';

import { getPaymentList } from './payment-methods-list';
import './index.css';

const b = block('bank-cards');

export function BankCards(): JSX.Element {
    useEffect(() => {
        // В формах стоит 530
        const templateClassName = window.innerWidth >= 530 ? TEMPLATE_CLASSNAME.desktop : TEMPLATE_CLASSNAME.mobile;

        /**
         * Важно!
         * Важно чтобы тема была на html а шаблон на body
         * Темы прогоняются через postcss-theme-fold
         * и становятся контекстом для остальных глобальных модификаторов
         */
        dom.addClass(document.documentElement, THEME_CLASSNAME.default);
        dom.addClass(document.body, templateClassName);
    }, []);

    const pmList = getPaymentList();

    return (
        <div className={b()}>
            <Text className={b('title').toString()} as="h2" typography="headline-l" weight="bold">
                Банковские карты
            </Text>
            <ul className={b('list')}>
                {pmList.map((item) => (
                    <li key={item.id} className={b('item')}>
                        <Text className={b('item-title').toString()} typography="headline-s">
                            {`issuer: ${item.issuer}`}
                        </Text>
                        <PaymentMethodDetails method={item.method} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
