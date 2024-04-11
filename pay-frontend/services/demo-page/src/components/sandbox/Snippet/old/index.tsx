import React, { useRef, useState, useEffect, useCallback } from 'react';

import * as Sdk from '@yandex-pay/sdk/src/typings';
import { block } from 'bem-cn';

import { DEFAULT_PAYMENT_SHEET, DEFAULT_PAYMENT_BUTTON } from './data';
import './index.css';

const b = block('snippet');
const availableButtonTypes = Object.values(Sdk.ButtonType);
const availableButtonThemes = Object.values(Sdk.ButtonTheme);
const availableButtonWidthValues = Object.values(Sdk.ButtonWidth);

interface SandboxSelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

function SandboxSelect({ label, options, value, onChange }: SandboxSelectProps): JSX.Element {
    return (
        <label className={b('select')} htmlFor={label}>
            {label}
            <select id={label} value={value} onChange={onChange}>
                {options.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
        </label>
    );
}

const formatLogs = (logs: any[]): string => {
    const messages = logs.map((log) =>
        [`Time: ${new Date().toLocaleTimeString()}`, JSON.stringify(log, null, 2)].join('\n'),
    );

    return messages.join('\n----\n');
};

export default function Snippet(): JSX.Element {
    const ref = useRef();
    const buttonRef = useRef<Sdk.Button>();
    const paymentRef = useRef<Sdk.Payment>();
    const sheetRef = useRef<HTMLTextAreaElement>();
    const [logs, setLogs] = useState([]);
    const [isPrepared, setPrepared] = useState(false);

    const [paymentSheet, setPaymentSheet] = useState(DEFAULT_PAYMENT_SHEET);
    const [styles, setStyles] = useState(DEFAULT_PAYMENT_BUTTON);

    const makeOptionChangeHandler = useCallback(
        (name: string) =>
            (event: React.ChangeEvent<HTMLSelectElement>): void => {
                const newValue = event.target.value;

                setStyles((state) => ({
                    ...state,
                    [name]: newValue,
                }));
            },
        [],
    );

    const changePaymentSheet = useCallback((): void => {
        if (!sheetRef.current) {
            return;
        }

        try {
            const { value } = sheetRef.current;
            const json = JSON.parse(value);
            setPaymentSheet(json);
        } catch (err) {
            alert('Invalid JSON');
        }
    }, []);

    useEffect(() => {
        const { YaPay } = window;

        YaPay.createPayment(paymentSheet)
            .then((payment) => {
                Object.values(Sdk.PaymentEventType).forEach((type) => {
                    payment.on(type, (event: any) => {
                        setLogs((list) => list.concat(event));
                    });
                });

                setPrepared(true);

                paymentRef.current = payment;
            })
            .catch((err) => {
                setLogs((list) => list.concat(err));
            });

        return (): void => {
            if (paymentRef.current) {
                paymentRef.current.destroy();
            }
            paymentRef.current = null;
        };
    }, [paymentSheet]);

    useEffect(() => {
        const { YaPay } = window;

        if (!YaPay) {
            console.error('YaPay does not exist on window.');

            return;
        }

        if (!isPrepared || !ref.current) {
            return;
        }

        if (buttonRef.current) {
            // @ts-ignore
            buttonRef.current.unmount();
            buttonRef.current = null;
        }

        const button = YaPay.Button.create(styles);

        // Смонтировать кнопку в dom.
        button.mount(ref.current);

        // Подписаться на событие click.
        button.on(Sdk.ButtonEventType.Click, () => {
            // Запустить оплату после клика на кнопку.
            paymentRef.current.checkout();
        });

        buttonRef.current = button;
    }, [isPrepared, styles, ref.current]);

    return (
        <div className={b()}>
            <div className={b('actions')}>
                <div className={b('action')}>
                    <SandboxSelect
                        label="Type"
                        options={availableButtonTypes}
                        value={styles.type}
                        onChange={makeOptionChangeHandler('type')}
                    />
                </div>
                <div className={b('action')}>
                    <SandboxSelect
                        label="Theme"
                        options={availableButtonThemes}
                        value={styles.theme}
                        onChange={makeOptionChangeHandler('theme')}
                    />
                </div>
                <div className={b('action')}>
                    <SandboxSelect
                        label="Width"
                        options={availableButtonWidthValues}
                        value={styles.width}
                        onChange={makeOptionChangeHandler('width')}
                    />
                </div>
            </div>
            <div className={b('view')} ref={ref} />

            <div className={b('data')}>
                <div className={b('sheet')}>
                    <div className={b('data-title')}>
                        <button type="button" onClick={changePaymentSheet}>
                            Apply
                        </button>
                    </div>
                    <textarea ref={sheetRef} defaultValue={JSON.stringify(paymentSheet, null, 2)} />
                </div>
                <div className={b('logs')}>
                    <div className={b('data-title')}>Лог событий</div>
                    <div className={b('logs-content')}>{formatLogs(logs)}</div>
                </div>
            </div>
        </div>
    );
}
