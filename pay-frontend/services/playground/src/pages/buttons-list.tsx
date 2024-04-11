import React, { useEffect, useState } from 'react';

import { classnames } from '@bem-react/classnames';

import { CustomButtonsSettings, CustomButtonsWrapper } from 'features/buttons-list';
import { Header } from 'features/header';

import { Layout } from '../components/layout';
import { Panel } from '../components/panel';
import { Row } from '../components/row';
import { getFromSessionStorage, setToSessionStorage } from '../lib/session-storage';

const storageKey = 'buttons-settings';
const { cashback, split, fall } = getFromSessionStorage(storageKey, {
    cashback: false,
    split: false,
    fall: false,
});

const InfoBlock = (
    <div className={classnames('max-w-md')}>
        <p>Чтобы увидеть все варианты кнопок, в профиле должны быть аватар и привязанная карта.</p>
        <p>Чтобы увидеть сплит, в профиле должен быть подтвержден телефон.</p>
    </div>
);

export function ButtonsList() {
    const [additionalOptionCashback, setAdditionalOptionCashback] = useState<boolean>(cashback);
    const [additionalOptionSplit, setAdditionalOptionSplit] = useState<boolean>(split);
    const [shouldFall, setShouldFall] = useState<boolean>(fall);

    useEffect(() => {
        setToSessionStorage(storageKey, {
            cashback: additionalOptionCashback,
            split: additionalOptionSplit,
            fall: shouldFall,
        });
    }, [additionalOptionCashback, additionalOptionSplit, shouldFall]);

    return (
        <Layout header={<Header />} main={null} needColumns={false}>
            <Row>
                <CustomButtonsSettings
                    setAdditionalOptionCashback={setAdditionalOptionCashback}
                    additionalOptionCashback={additionalOptionCashback}
                    setAdditionalOptionSplit={setAdditionalOptionSplit}
                    additionalOptionSplit={additionalOptionSplit}
                    setAdditionalOptionFall={setShouldFall}
                    additionalOptionFall={shouldFall}
                />
                <Panel caption="Важно">{InfoBlock}</Panel>
            </Row>

            <Row>
                <CustomButtonsWrapper
                    additionalOption={{
                        cashback: additionalOptionCashback,
                        split: additionalOptionSplit,
                    }}
                    fall={shouldFall}
                />
            </Row>
        </Layout>
    );
}
