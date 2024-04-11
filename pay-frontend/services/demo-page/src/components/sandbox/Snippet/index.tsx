import React, { useState, useCallback, useContext, useEffect } from 'react';

import pathOr from '@tinkoff/utils/object/pathOr';
import Amount from '@trust/ui/components/ui/amount';
import { Text } from '@yandex-lego/components/Text/desktop/bundle';
import { block } from 'bem-cn';

import { scenarioContext } from '../../../store/scenario';

import stationSrc from './img/station.png';
import stationSrcX2 from './img/station_2x.png';
import './index.css';
import { PaymentStatus } from './PaymentStatus';
import { YandexPay } from './YandexPay';

const b = block('snippet');

export function Snippet(): JSX.Element {
    const scenario = useContext(scenarioContext);

    const [status, setStatus] = useState('init');
    const [key, setKey] = useState(0);
    const [amount, setAmount] = useState('');
    const [currencyCode, setCurrencyCode] = useState('RUB');

    const setProgress = useCallback(() => setStatus('progress'), []);
    const setReady = useCallback(() => setStatus('ready'), []);
    const setSuccess = useCallback(() => setStatus('success'), []);
    const setError = useCallback(() => setStatus('error'), []);
    const setDisabled = useCallback(() => setStatus('disabled'), []);

    useEffect(() => {
        setAmount(pathOr(['order', 'total', 'amount'], '', scenario.sheet.data));
        setCurrencyCode(pathOr(['currencyCode'], 'RUB', scenario.sheet.data));
    }, [scenario.sheet.data]);

    const resetStatus = useCallback(() => {
        setKey((_key) => _key + 1);
        setStatus('init');
    }, []);

    return (
        <div className={b()}>
            <img
                className={b('picture')}
                alt="Yandex Station"
                src={stationSrc}
                srcSet={`${stationSrcX2} 2x`}
            />
            <div className={b('info')}>
                <div className={b('header')}>
                    <div className={b('title')}>
                        <Text typography="display-m" weight="medium">
                            Умная колонка Яндекс.Станция
                        </Text>
                    </div>
                    <div className={b('price')}>
                        <Text typography="display-m" weight="bold">
                            <Amount amount={amount} currency={currencyCode} />
                        </Text>
                    </div>
                </div>
                <div className={b('description')}>
                    <Text typography="headline-s" weight="regular">
                        «Яндекс.Станция» — умная колонка с голосовым помощником Алисой. Она может
                        порекомендовать фильм, включить его или поставить музыку, разбудит вас
                        утром, напомнит позвонить маме или выключить духовку.
                    </Text>
                </div>

                <div className={b('button')}>
                    <YandexPay
                        key={key}
                        className={b('yapay')}
                        onReady={setReady}
                        onProcess={setProgress}
                        onSuccess={setSuccess}
                        onError={setError}
                        onDisabled={setDisabled}
                    />
                    <PaymentStatus status={status} onClose={resetStatus} />
                </div>
            </div>
        </div>
    );
}
