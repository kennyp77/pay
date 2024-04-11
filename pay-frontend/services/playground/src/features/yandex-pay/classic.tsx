import * as React from 'react';
import { useCallback, useRef } from 'react';

import { classnames } from '@bem-react/classnames';
import isEqual from '@tinkoff/utils/is/equal';
import { dom } from '@trust/utils/dom';
import * as Sdk from '@yandex-pay/sdk/src/typings';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { LogRecordOwner } from 'enum/LogRecordOwner';
import { Cart } from 'helpers/cart';
import { useLogEvent } from 'hooks/use-log';
import { useOption } from 'hooks/use-options';
import { getPaymentSheet } from 'store/selectors';

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

export const YandexPayClassic: React.FC<YandexPayProps> = function YandexPayClassic({
    className,
    onReady = noop,
    onProcess = noop,
    onSuccess = noop,
    onAbort = noop,
    onError = noop,
    onInvalidMerchant = noop,
}) {
    const log = useLogEvent();

    const [buttonType] = useOption(['buttonType']);
    const [buttonTheme] = useOption(['buttonTheme']);
    const [buttonWidth] = useOption(['buttonWidth']);

    const paymentSheet = useSelector(getPaymentSheet, isEqual);

    const paymentRef = useRef<Sdk.Payment | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const unmountRef = useRef<boolean>(false);

    const setupPaymentListeners = useCallback(
        (payment: Sdk.Payment) => {
            const cart = Cart.fromOrder(paymentSheet.order);

            payment.on(Sdk.PaymentEventType.Process, (event) => {
                log({
                    sender: LogRecordOwner.Sdk_Payment,
                    receiver: LogRecordOwner.PG_React,
                    message: event,
                });

                onProcess();
                cart.resetAdditionals();

                payment.complete(Sdk.CompleteReason.Success);
                onSuccess();
            });

            payment.on(Sdk.PaymentEventType.Abort, (event) => {
                log({
                    sender: LogRecordOwner.Sdk_Payment,
                    receiver: LogRecordOwner.PG_React,
                    message: event,
                });
                cart.resetAdditionals();

                onAbort();
            });

            payment.on(Sdk.PaymentEventType.Error, (event) => {
                log({
                    sender: LogRecordOwner.Sdk_Payment,
                    receiver: LogRecordOwner.PG_React,
                    message: event,
                });
                cart.resetAdditionals();

                onError();
            });
        },
        [paymentSheet.order, onProcess, onSuccess, onAbort, onError, log],
    );

    const setup = useCallback(async () => {
        const { YaPay } = window;

        if (!YaPay) {
            return;
        }

        if (!paymentSheet.merchant.id) {
            return onInvalidMerchant();
        }

        if (!buttonRef.current) {
            return onError('buttonRef is undefined');
        }

        const payment = await YaPay.createPayment(paymentSheet);

        if (unmountRef.current) {
            return payment.destroy();
        }

        payment.mountButton(buttonRef.current, {
            type: buttonType,
            theme: buttonTheme,
            width: buttonWidth,
        });

        const originalUpdate = payment.update;
        payment.update = (updatedData) => {
            log({
                sender: LogRecordOwner.PG_React,
                receiver: LogRecordOwner.Sdk_Payment,
                message: { type: 'update', ...updatedData },
            });

            originalUpdate.call(payment, updatedData);
        };

        setupPaymentListeners(payment);

        paymentRef.current = payment;

        onReady();
    }, [
        paymentSheet,
        buttonType,
        buttonTheme,
        buttonWidth,
        setupPaymentListeners,
        onReady,
        onError,
        onInvalidMerchant,
        log,
    ]);

    useEffectOnce(() => {
        let offClick = () => {};

        setup().then(
            () => {
                log({
                    sender: LogRecordOwner.PG_React,
                    message: 'Sdk.Button was mounted',
                });
                if (buttonRef.current) {
                    offClick = dom.on(buttonRef.current, 'click', () => {
                        log({
                            sender: LogRecordOwner.Sdk_Button,
                            receiver: LogRecordOwner.PG_React,
                            message: 'Click on Sdk.Button',
                        });
                    });
                }
            },
            (err) => {
                console.error(err);
                onError();
            },
        );

        return () => {
            offClick();
            unmountRef.current = true;
            paymentRef.current?.destroy();
        };
    });

    return (
        <div className={classnames('flex', 'items-center', 'h-14', className)} ref={buttonRef} />
    );
};
