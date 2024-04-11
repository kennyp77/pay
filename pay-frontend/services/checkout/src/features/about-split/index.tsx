import React, { useCallback } from 'react';

import { cn } from '@bem-react/classname';

import { Button } from '../../components/button';
import { Icon } from '../../components/icons';
import { Panel, PanelHeader } from '../../components/panel';
import { Text } from '../../components/text';
import { history, Path } from '../../router';

import FullSplitLogo from './assets/full-split-logo.svg';
import './index.css';

const cnAboutSplit = cn('AboutSplit');

const i18n = (v: string) => v;

interface AboutSplitProps {
    width?: 'auto' | 'fixed';
}

export const AboutSplit: React.FC<AboutSplitProps> = ({ width = 'auto' }) => {
    const goMain = useCallback(() => history.push(Path.Main), []);

    return (
        <Panel
            className={cnAboutSplit({ width })}
            header={
                <PanelHeader
                    closeHref={Path.Main}
                    title={<Icon className={cnAboutSplit('SplitLogo')} svg={FullSplitLogo} />}
                    titleAlign="left"
                />
            }
            footer={
                <Button
                    onClick={goMain}
                    view="action"
                    variant="split"
                    size="l"
                    width="max"
                    pin="round-m"
                >
                    {i18n('Понятно')}
                </Button>
            }
        >
            <Text variant="header-l">{i18n('Почему в корзине появился значок Сплит?')}</Text>
            <Text top="s">
                {i18n(
                    'Сплитить можно не только конкретный товар, но и общую сумму заказа. От 1 000 ₽ в корзине появится значок — даже если его не было в товаре.',
                )}
            </Text>

            <Text top="3xl" variant="header-l">
                {i18n('Как работает Сплит?')}
            </Text>
            <Text top="s">
                {i18n(
                    'Он делит сумму вашего заказа на четыре части. Первую списываем с банковской карты сразу, оставшиеся три — раз в две недели. Вы видите точный график платежей сразу при оформлении, поэтому списания не станут неожиданностью.',
                )}
            </Text>

            <Text top="3xl" variant="header-l">
                {i18n('Я оплачиваю что-то ещё?')}
            </Text>
            <Text top="s">
                {i18n(
                    'Нет. Никаких комиссий и дополнительных платежей — вы оплачиваете только сумму заказа. Небольшой процент за услугу платит сам продавец — сервис помогает ему получить больше покупателей.',
                )}
            </Text>
            <Text top="3xl" variant="header-l">
                {i18n('Почему первый платёж больше остальных?')}
            </Text>
            <Text top="s">
                {i18n(
                    'В заказе могут быть товары, на которые нельзя оформить Сплит, или общая сумма оказалась больше вашего лимита. Всё это прибавляем к первому платежу, остальное — по расписанию.',
                )}
            </Text>
            <Text top="3xl" variant="header-l">
                {i18n('Какие нужны документы?')}
            </Text>
            <Text top="s">{i18n('Никаких. Мы попросим подтвердить только номер телефона.')}</Text>
            <Text top="3xl" variant="header-l">
                {i18n('Что, если я передумаю?')}
            </Text>
            <Text top="s">
                {i18n(
                    'Вернуть сплит-заказ можно так же, как и обычный. Все деньги мы отправим обратно на карту, которой вы оплачивали.',
                )}
            </Text>
            <Text top="3xl" variant="header-l">
                {i18n('Это безопасно?')}
            </Text>
            <Text top="s">
                {i18n(
                    'Абсолютно. Не переживайте, мы не оформляем на вас кредит и не скрываем дополнительных условий «под звёздочкой».',
                )}
            </Text>
        </Panel>
    );
};
