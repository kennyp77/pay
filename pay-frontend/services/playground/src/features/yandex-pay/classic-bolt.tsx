import * as React from 'react';
import { useCallback, useRef, useState } from 'react';

import { classnames } from '@bem-react/classnames';
import clone from '@tinkoff/utils/clone';
import isEqual from '@tinkoff/utils/is/equal';
import * as Sdk from '@yandex-pay/sdk/src/typings';
import { ButtonTheme, ButtonType, ButtonWidth } from '@yandex-pay/sdk/src/typings';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { LogRecordOwner } from 'enum/LogRecordOwner';
import { useLogEvent } from 'hooks/use-log';
import { getDynamicCartOption, getPaymentSheetBolt } from 'store/selectors';

// Подтянуть ветку с работающим чекаутом на новом апи и обновить компонент
interface YandexPayProps {
    className?: string;

    onReady?(): void;
    onProcess?(): void;
    onSuccess?(): void;
    onAbort?(): void;
    onError?(reason?: string): void;
    onInvalidMerchant?(): void;
}

const noop = () => void 0;

export const YandexPayClassicBolt: React.FC<YandexPayProps> = function YandexPayClassicBolt({
    className,
    onReady = noop,
    onProcess = noop,
    onSuccess = noop,
    onAbort = noop,
    onError = noop,
    onInvalidMerchant = noop,
}) {
    const log = useLogEvent();

    const paymentSheet = useSelector(getPaymentSheetBolt, isEqual);
    const hasDynamicCart = useSelector(getDynamicCartOption);

    const [dynamicCartStatus, setDynamicCartStatus] = useState('\u00A0');

    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const paymentRef = useRef<Sdk.CheckoutPayment | null>(null);
    const unmountRef = useRef<boolean>(false);

    const setup = useCallback(async () => {
        const { YaPay } = window;

        if (!YaPay) {
            return;
        }

        if (!paymentSheet.merchantId) {
            return onInvalidMerchant();
        }

        if (!buttonContainerRef.current) {
            return onError('buttonContainerRef is undefined');
        }

        const payment = await YaPay.createPayment(paymentSheet);

        if (unmountRef.current) {
            return payment.destroy();
        }

        payment.mountButton(buttonContainerRef.current, {
            type: ButtonType.Pay,
            theme: ButtonTheme.Black,
            width: ButtonWidth.Auto,
        });

        log({
            sender: LogRecordOwner.PG_React,
            message: 'Sdk.Button was mounted',
        });

        payment.on(Sdk.PaymentEventType.Ready, (event) => {
            log({
                sender: LogRecordOwner.Sdk_Payment,
                receiver: LogRecordOwner.PG_React,
                message: event,
            });

            onReady();
        });

        payment.on(Sdk.PaymentEventType.Success, (event) => {
            log({
                sender: LogRecordOwner.Sdk_Payment,
                receiver: LogRecordOwner.PG_React,
                message: event,
            });

            onSuccess();
        });

        payment.on(Sdk.PaymentEventType.Abort, (event) => {
            log({
                sender: LogRecordOwner.Sdk_Payment,
                receiver: LogRecordOwner.PG_React,
                message: event,
            });

            onAbort();
        });

        payment.on(Sdk.PaymentEventType.Error, (event) => {
            log({
                sender: LogRecordOwner.Sdk_Payment,
                receiver: LogRecordOwner.PG_React,
                message: event,
            });

            onError();
        });

        paymentRef.current = payment;
    }, [paymentSheet, onSuccess, onAbort, onError, onReady, onInvalidMerchant, log]);

    useEffectOnce(() => {
        setup().catch((err) => {
            console.error(err);
            onError();
        });

        return () => {
            unmountRef.current = true;
            paymentRef.current?.destroy();
        };
    });

    useEffectOnce(() => {
        if (hasDynamicCart) {
            setTimeout(() => {
                if (unmountRef.current) {
                    return;
                }

                const { metadata } = paymentSheet;
                const cart = clone(paymentSheet.cart);

                cart.items.push(...cart.items);

                paymentRef.current?.update({ cart, metadata });

                setDynamicCartStatus('Корзина Х2');
            }, 3000);
        }
    });

    return (
        <div>
            <div
                className={classnames('flex', 'items-center', 'h-14', className)}
                ref={buttonContainerRef}
            />
            {hasDynamicCart ? <div className="text-center">{dynamicCartStatus}</div> : null}
        </div>
    );
};
