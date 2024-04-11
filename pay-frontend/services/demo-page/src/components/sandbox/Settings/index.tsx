import React, { useState, useContext, useEffect } from 'react';

import { compose } from '@bem-react/core';
import { TabsMenu as TabsMenuDesktop, withSizeM, withLayoutHoriz } from '@yandex-lego/components/TabsMenu/desktop';
import { block } from 'bem-cn';

import { resultContext } from '../../../store/result';

import { ButtonStyle } from './ButtonStyle';
import { withViewDemo } from './components/TabsMenu/_demo';
import { Result } from './Result';
import { Scenario } from './Scenario';
import './index.css';

const TabsMenu = compose(withViewDemo, withLayoutHoriz, withSizeM)(TabsMenuDesktop);

const b = block('settings');

const tabs = [
    {
        id: 'buttonStyle',
        content: 'Стиль кнопки',
    },
    {
        id: 'payScript',
        content: 'Сценарий оплаты',
    },
    {
        id: 'result',
        content: 'Результат',
    },
];

export function Settings(): JSX.Element {
    const [activeTab, setActiveTab] = useState('buttonStyle');
    const resultCtx = useContext(resultContext);

    useEffect(() => {
        if (resultCtx.startTime) {
            setActiveTab('result');
        }
    }, [resultCtx.startTime]);

    return (
        <div className={b()}>
            <div className={b('tabs')}>
                <TabsMenu
                    size="m"
                    view="demo"
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
                {activeTab === 'buttonStyle' && <ButtonStyle />}
                {activeTab === 'payScript' && <Scenario />}
                {activeTab === 'result' && <Result />}
            </div>
        </div>
    );
}
