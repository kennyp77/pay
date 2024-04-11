import * as React from 'react';
import { useCallback, useRef } from 'react';

import { classnames } from '@bem-react/classnames';
import isEqual from '@tinkoff/utils/is/equal';
import * as Sdk from '@yandex-pay/sdk/src/typings';
import { ButtonEventType, ButtonTheme, ButtonType, ButtonWidth } from '@yandex-pay/sdk/src/typings';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { validateCoupon } from 'data/coupons';
import { loadPickPoints, loadPickPointsByInfo } from 'data/pickup';
import { LogRecordOwner } from 'enum/LogRecordOwner';
import { Cart } from 'helpers/cart';
import { useLogEvent } from 'hooks/use-log';
import { useOption, useAvailableOptions } from 'hooks/use-options';
import { getCheckoutSheet } from 'store/selectors';
import { createOptionIterator, getOptionsList } from 'utils/available-options';

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

const SETUP_BOUNDS = {
    ne: { latitude: 56.01426435898404, longitude: 37.90342261311579 },
    sw: { latitude: 55.468877418368145, longitude: 37.29917456624078 },
};

// Эмуляция ответа мерча (холодильник отвечает в среднем 1-3 секунды)
const getPointsTimeout = (): number => {
    const min = 1000;
    const max = 3500;

    return min + Math.random() * (max - min);
};

export const YandexPayCheckout: React.FC<YandexPayProps> = function YandexPayCheckout({
    className,
    onReady = noop,
    onProcess = noop,
    onSuccess = noop,
    onAbort = noop,
    onError = noop,
    onInvalidMerchant = noop,
}) {
    const buttonContainerRef = useRef<HTMLDivElement>(null);

    const log = useLogEvent();

    const [shippingAnswer] = useOption(['shippingAnswer']);
    const shippingOptions = useAvailableOptions(['shippingOptions']);

    const [pickupSetup] = useOption(['pickupSetup']);
    const [pickupAnswer] = useOption(['pickupAnswer']);

    const paymentSheet = useSelector(getCheckoutSheet, isEqual);

    const paymentRef = useRef<Sdk.Payment | null>(null);
    const buttonRef = useRef<Sdk.Button | null>(null);
    const unmountRef = useRef<boolean>(false);

    const setupPaymentListeners = useCallback(
        (payment: Sdk.Payment) => {
            const cart = Cart.fromOrder(paymentSheet.order);

            const getNextShippingOption = createOptionIterator(
                getOptionsList(shippingOptions, shippingAnswer),
                {
                    freezeOnLast: true,
                },
            );

            payment.on(Sdk.PaymentEventType.Process, (event) => {
                log({
                    sender: LogRecordOwner.Sdk_Payment,
                    receiver: LogRecordOwner.PG_React,
                    message: event,
                });

                onProcess();
                cart.resetAdditionals();

                setTimeout(() => {
                    payment.complete(Sdk.CompleteReason.Success);
                    onSuccess();
                }, 100);
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

            payment.on(Sdk.PaymentEventType.Setup, async (event) => {
                // Специально без Промиса, чтобы проверять работу на старом АПИ
                log({
                    sender: LogRecordOwner.Sdk_Payment,
                    receiver: LogRecordOwner.PG_React,
                    message: event,
                });

                // Получение начальных точек самовывоза
                if (event.pickupPoints) {
                    if (pickupSetup) {
                        const pickupPoints = await loadPickPoints(SETUP_BOUNDS, pickupAnswer);

                        payment.setup({ pickupPoints });
                    } else {
                        log({
                            sender: LogRecordOwner.PG_React,
                            message: 'Skip pickup points setup',
                        });
                    }
                }
            });

            payment.on(Sdk.PaymentEventType.Change, (event) => {
                return new Promise(async (resolve) => {
                    log({
                        sender: LogRecordOwner.Sdk_Payment,
                        receiver: LogRecordOwner.PG_React,
                        message: event,
                    });

                    // Изменение купона
                    if (event.coupon) {
                        const { amount, error } = validateCoupon(
                            event.coupon,
                            cart.getTotalAmount(),
                        );

                        if (amount) {
                            cart.setPromocode(amount);

                            resolve({ order: cart.getOrder() });
                        }

                        if (error) {
                            setTimeout(resolve, 500, { errors: [error] });
                        }
                    }

                    // Изменение адреса доставки
                    if (event.shippingAddress) {
                        const shippingOptions = getNextShippingOption();

                        if (shippingOptions) {
                            setTimeout(resolve, 500, { shippingOptions });
                        }
                    }

                    // Изменение варианта доставки
                    if (event.shippingOption) {
                        cart.setShipping(event.shippingOption);

                        setTimeout(resolve, 500, { order: cart.getOrder() });
                    }

                    // Изменение области просмотра карты
                    if (event.pickupArea) {
                        const pickupPoints = await loadPickPoints(
                            event.pickupArea.bounds,
                            pickupAnswer,
                        );

                        if (pickupPoints) {
                            setTimeout(resolve, getPointsTimeout(), { pickupPoints });
                        }
                    }

                    if (event.pickupInfo) {
                        const pickupPoint = await loadPickPointsByInfo(
                            event.pickupInfo,
                            pickupAnswer,
                        );

                        if (pickupPoint) {
                            setTimeout(resolve, getPointsTimeout(), { pickupPoint });
                        }
                    }

                    // Изменение пункта самовывоза
                    if (event.pickupPoint) {
                        cart.setPickup(event.pickupPoint);

                        setTimeout(resolve, 500, { order: cart.getOrder() });
                    }
                });
            });

            payment.on(Sdk.PaymentEventType.Reset, (event) => {
                log({
                    sender: LogRecordOwner.Sdk_Payment,
                    receiver: LogRecordOwner.PG_React,
                    message: event,
                });

                if (event.shippingOption) {
                    cart.resetShipping();

                    setTimeout(() => {
                        payment.update({ order: cart.getOrder() });
                    }, 500);
                }

                if (event.coupon) {
                    cart.resetPromocode();

                    setTimeout(() => {
                        payment.update({ order: cart.getOrder() });
                    }, 500);
                }
            });
        },
        [
            shippingOptions,
            shippingAnswer,
            pickupAnswer,
            pickupSetup,
            paymentSheet.order,
            onProcess,
            onSuccess,
            onAbort,
            onError,
            log,
        ],
    );

    const setup = useCallback(async () => {
        const { YaPay } = window;

        if (!YaPay) {
            return;
        }

        if (!paymentSheet.merchant.id) {
            return onInvalidMerchant();
        }

        if (!buttonContainerRef.current) {
            return onError('buttonContainerRef is undefined');
        }

        const payment = await YaPay.createPayment(paymentSheet);

        const originalUpdate = payment.update;
        payment.update = (updatedData) => {
            log({
                sender: LogRecordOwner.PG_React,
                receiver: LogRecordOwner.Sdk_Payment,
                message: { type: 'update', ...updatedData },
            });

            originalUpdate.call(payment, updatedData);
        };

        if (unmountRef.current) {
            return payment.destroy();
        }

        const button = payment.createButton({
            type: ButtonType.Checkout,
            theme: ButtonTheme.Black,
            width: ButtonWidth.Auto,
        });

        button.on(ButtonEventType.Click, () => {
            log({
                sender: LogRecordOwner.Sdk_Button,
                receiver: LogRecordOwner.PG_React,
                message: 'Click on Sdk.Button',
            });

            payment.checkout();
        });

        button.mount(buttonContainerRef.current);

        setupPaymentListeners(payment);

        paymentRef.current = payment;
        buttonRef.current = button;

        onReady();
    }, [paymentSheet, setupPaymentListeners, onReady, onError, onInvalidMerchant, log]);

    useEffectOnce(() => {
        setup().then(
            () => {
                log({
                    sender: LogRecordOwner.PG_React,
                    message: 'Sdk.Button was mounted',
                });
            },
            (err) => {
                console.error(err);
                onError();
            },
        );

        return () => {
            unmountRef.current = true;
            paymentRef.current?.destroy();
            buttonRef.current?.destroy();
        };
    });

    return (
        <div
            className={classnames('flex', 'items-center', 'h-14', className)}
            ref={buttonContainerRef}
        />
    );
};
