import { useCallback, useState, useEffect, useRef } from 'react';
import * as React from 'react';

import { classnames } from '@bem-react/classnames';
import { ButtonWidth } from '@yandex-pay/sdk/src/typings';
import { useSelector } from 'react-redux';

import { Button } from 'components/button';
import { DEV_USERNAME } from 'config';
import { LogRecordOwner } from 'enum/LogRecordOwner';
import { YandexPayClassic } from 'features/yandex-pay';
import { useLogEvent, useResetLogRecords } from 'hooks/use-log';
import { useOption } from 'hooks/use-options';
import { getStateVersion } from 'store/selectors';

import { StatusBar } from './status-bar';

const defaultState = {
    version: 0,
    show: true,
    status: '',
    message: '',
};

interface PreviewProps {
    button: typeof YandexPayClassic;
}

export function Preview({ button: YandexPayButton }: PreviewProps) {
    const log = useLogEvent();
    const resetLogRecords = useResetLogRecords();

    const stateVersion = useSelector(getStateVersion);
    const [buttonWidth] = useOption(['buttonWidth']);
    const [payState, setPayState] = useState(defaultState);

    useEffect(() => {
        if (stateVersion > 1) {
            setPayState({ show: false, status: '', message: 'Обновлены настройки', version: 0 });
        }
    }, [stateVersion]);

    const updatePayState = useCallback(
        (payState: Partial<typeof defaultState>) => {
            setPayState((prev) => ({ ...prev, ...payState }));
        },
        [setPayState],
    );

    const resetPayState = useCallback(() => {
        resetLogRecords();
        updatePayState({ ...defaultState, version: Date.now() });
    }, [updatePayState, resetLogRecords]);

    const onReady = useCallback(() => {
        log({
            sender: LogRecordOwner.PG_React,
            message: 'YandexPay ready',
        });
    }, [log]);

    const onProcess = useCallback(() => {
        log({
            sender: LogRecordOwner.PG_React,
            message: 'YandexPay process',
        });
    }, [log]);

    const onError = useCallback(
        (reason?: string) => {
            log({
                sender: LogRecordOwner.PG_React,
                message: 'YandexPay error',
            });
            updatePayState({ status: 'error', message: reason || 'Ошибка при оплате' });
        },
        [log, updatePayState],
    );

    const onAbort = useCallback(() => {
        log({
            sender: LogRecordOwner.PG_React,
            message: 'YandexPay abort',
        });
        updatePayState({ status: 'info', message: 'Платеж отменен' });
    }, [log, updatePayState]);

    const onSuccess = useCallback(() => {
        log({
            sender: LogRecordOwner.PG_React,
            message: 'YandexPay success',
        });
        updatePayState({ status: 'success', message: 'Успешная оплата' });
    }, [log, updatePayState]);

    const onInvalidMerchant = useCallback(() => {
        log({
            sender: LogRecordOwner.PG_React,
            message: 'YandexPay invalid merchant',
        });
        updatePayState({
            show: false,
            status: 'error',
            message: DEV_USERNAME
                ? `Не удалось определить мерча (${DEV_USERNAME})`
                : 'Не удалось определить мерча',
        });
    }, [log, updatePayState]);

    return (
        <div>
            <div
                className={classnames(
                    'flex',
                    'flex-col',
                    'justify-center',
                    'bg-white',
                    'dark:bg-blue-gray-1800',
                    'rounded-xl',
                    'min-h-[100px]',
                    'relative',
                )}
            >
                {payState.message ? (
                    <div
                        className={classnames(
                            'flex',
                            'flex-col',
                            'justify-center',
                            'items-center',
                            'bg-white',
                            'dark:bg-blue-gray-1800',
                            'rounded-xl',
                            'absolute',
                            'inset-0',
                            'z-10',
                        )}
                    >
                        <span
                            className={classnames(
                                'rounded-xl',
                                'px-2',
                                'py-1',
                                'text-center',
                                'text-current',
                                'text-body-long-m',
                                'leading-4',
                                'font-medium',
                                'text-white',
                                payState.status === 'info' ? 'bg-stone-500' : '',
                                payState.status === 'success' ? 'bg-green-500' : '',
                                payState.status === 'error' ? 'bg-rose-500' : '',
                            )}
                        >
                            {payState.message}
                        </span>
                        <Button className={classnames('mx-auto', 'mt-2')} onClick={resetPayState}>
                            Показать кнопку
                        </Button>
                    </div>
                ) : null}

                <div
                    className={classnames(
                        'my-0',
                        buttonWidth === ButtonWidth.Auto ? 'mx-auto' : 'mx-4',
                    )}
                >
                    {payState.show ? (
                        <YandexPayButton
                            key={payState.version}
                            onReady={onReady}
                            onProcess={onProcess}
                            onError={onError}
                            onAbort={onAbort}
                            onSuccess={onSuccess}
                            onInvalidMerchant={onInvalidMerchant}
                        />
                    ) : null}
                </div>
            </div>
            <div className="p-1" />
            <StatusBar />
        </div>
    );
}
