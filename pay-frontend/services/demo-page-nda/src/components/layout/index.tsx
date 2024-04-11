import React, { useState } from 'react';

import { compose } from '@bem-react/core';
import {
    TabsMenu as TabsMenuDesktop,
    withSizeM,
    withLayoutHoriz,
    withViewDefault,
} from '@yandex-lego/components/TabsMenu/desktop';
import { block } from 'bem-cn';

import { BankCards } from '../bank-cards';
import { MobileApiAssets } from '../mobile-api-assets';

import './index.css';

const TabsMenu = compose(withViewDefault, withLayoutHoriz, withSizeM)(TabsMenuDesktop);

const b = block('layout');

const tabs = [
    {
        id: 'bankCards',
        content: 'Банковские карты (web)',
    },
    {
        id: 'mobileApiAssets',
        content: 'Мобильные изображения',
    },
];

export function Layout(): JSX.Element {
    const [activeTab, setActiveTab] = useState('bankCards');

    return (
        <div className={b()}>
            <div className={b('tabs')}>
                <TabsMenu
                    size="m"
                    view="default"
                    layout="horiz"
                    activeTab={activeTab}
                    tabs={tabs.map(({ id, content }) => ({
                        id,
                        content,
                        onClick: (): void => setActiveTab(id),
                    }))}
                />
            </div>
            <div className={b('screens')}>
                {activeTab === 'bankCards' && <BankCards />}
                {activeTab === 'mobileApiAssets' && <MobileApiAssets />}
            </div>
        </div>
    );
}
