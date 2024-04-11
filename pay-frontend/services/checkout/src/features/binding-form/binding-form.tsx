import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@bem-react/classname';
import once from '@tinkoff/utils/function/once';
import { CardSystem } from '@trust/utils/cards';
import { dom } from '@trust/utils/dom';
import TrustSDK from '@yandex-trust-sdk/base';
import { TrustApiError } from '@yandex-trust-sdk/base/dist-cjs/errors';
import { BindCardOptions } from '@yandex-trust-sdk/base/dist-cjs/methods/bind-card';
import { PaymentFrame } from '@yandex-trust-sdk/base/dist-cjs/methods/payment-form';
import { FrameMessageAbortReason } from '@yandex-trust-sdk/base/dist-cjs/types';
import { useSelector } from 'react-redux';

import { hasExp } from 'helpers/experiment';

import { Button } from '../../components/button';
import { Icon } from '../../components/icons';
import { Row } from '../../components/row';
import SecureIcon from '../../components/secure/assets/secure.svg';
import { Text } from '../../components/text';
import { API_TRUST_HOST, API_TRUST_SERVICE_TOKEN } from '../../config';
import { counters } from '../../counters';
import { isTouchTemplate } from '../../helpers/app';
import { checkIsCardAllowed } from '../../helpers/user-card';
import { getCurrencyCode, getSheet, getTotalAmount } from '../../store/payment';
import { CompleteReason } from '../../typings';

import { metrika } from './metrika';

import './binding-form.scss';

const newCardWideButton = hasExp('new_card_wide_button');

const LOAD_FRAME_TIMEOUT = 15000;

const i18n = (v: string) => v;

const trustSdk = TrustSDK.create({ apiHost: API_TRUST_HOST });
const sdkBindOptions: BindCardOptions = {
    template: 'binding',
    mode: 'spin',
    isMobile: isTouchTemplate(),
    serviceToken: API_TRUST_SERVICE_TOKEN,
    queryParams: { remote_control: 'true' },
};

export interface BindingFormProps {
    onSuccess?(cardId: string): void;
    onError?(reason: string): void;
    onAbort?(reason: string): void;
    onReady?(): void;
    onSubmit?(): void;
    onAuthStart?(): void; // Authentication start
    onAuthEnd?(): void; // Authentication end

    onVisibilityChange?(visible: boolean): void;
}

const cnBindingForm = cn('BindingForm');

export function BindingForm({
    onSuccess,
    onError,
    onAbort,
    onReady,
    onSubmit,
    onAuthStart,
    onAuthEnd,
    onVisibilityChange,
}: BindingFormProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const frameStatus = useRef({ mounted: false, ready: false });
    const [paymentFrame, setPaymentFrame] = useState<PaymentFrame>();

    const [isAuthScreen, setIsAuthScreen] = useState(false);
    const [isCardAllowed, setIsCardAllowed] = useState(true);
    const [isDisabled, setIsDisabled] = useState(true);

    const sheet = useSelector(getSheet);
    const currencyCode = useSelector(getCurrencyCode);
    const totalAmount = useSelector(getTotalAmount);

    useEffect(() => {
        const offFnList = [
            dom.on(window, 'beforeunload', metrika.onCloseTracking),
            dom.on(window, 'unload', metrika.onCloseTracking),
        ];

        metrika.startTrackingBinding();

        let isMounted = true;

        trustSdk
            .bindCard(sdkBindOptions)
            .then((paymentFrame) => {
                if (!isMounted) {
                    return;
                }

                frameStatus.current.ready = false;
                setPaymentFrame(paymentFrame);
            })
            .catch((e: TrustApiError) => {
                metrika.stopBindingCreateLoadingError();

                if (isMounted) {
                    onError?.(e.message);
                }
            });

        return () => {
            isMounted = false;

            offFnList.forEach((offFn) => offFn());
        };
    }, [onError]);

    // Монтируем форму привязки в HTMl Node
    useEffect(() => {
        if (paymentFrame && frameStatus.current.mounted) {
            return;
        }

        if (paymentFrame && frameRef.current) {
            metrika.startTrackingFrame();

            setTimeout(() => {
                if (!frameStatus.current.ready) {
                    onError?.('Frame load timeout');
                }
            }, LOAD_FRAME_TIMEOUT);

            paymentFrame.mount(frameRef.current);
            frameStatus.current.mounted = true;
        }

        return (): void => {
            if (paymentFrame && frameStatus.current.mounted) {
                paymentFrame.unmount();
                // eslint-disable-next-line
                frameStatus.current.mounted = false;
            }
        };
    }, [onError, paymentFrame]);

    // NB: сбрасывать при изменении frame
    // eslint-disable-next-line
    const logFirstUserInput = useMemo(() => once(metrika.userInputTracking), [paymentFrame]);

    useEffect(() => {
        if (!paymentFrame) {
            return;
        }

        paymentFrame.on('form-ready', () => {
            counters.addPaymentMethod('loaded');
            frameStatus.current.ready = true;
            metrika.stopFrameLoading();

            onReady?.();
            onVisibilityChange?.(true);
            setIsAuthScreen(false);
        });

        paymentFrame.on('form-status', (event) => {
            logFirstUserInput();

            const canSubmit = Boolean(event.data.canSubmit);
            const cardSystemInfo = event.data.cardSystem || CardSystem.Unknown;

            if (canSubmit) {
                counters.bindingCanSubmit();
            }

            setIsCardAllowed(checkIsCardAllowed(sheet, cardSystemInfo));
            setIsDisabled(!canSubmit);
        });

        paymentFrame.on('form-submit', () => {
            counters.addPaymentMethod('sent');

            onSubmit?.();
            onVisibilityChange?.(false);
            setIsDisabled(true);
        });

        paymentFrame.on('auth-start', () => {
            counters.addPaymentMethod('3ds');

            onAuthStart?.();
            onVisibilityChange?.(true);
            setIsAuthScreen(true);
        });

        paymentFrame.on('auth-end', () => {
            onAuthEnd?.();
            onVisibilityChange?.(false);
            setIsAuthScreen(false);
        });

        paymentFrame.on('error', (event) => {
            counters.addPaymentMethod('result', CompleteReason.Error);
            onError?.(event.reason);
        });

        paymentFrame.on('abort', (event) => {
            switch (event.reason) {
                case FrameMessageAbortReason.timeout:
                    counters.addPaymentMethod('result', CompleteReason.Timeout);
                    break;
                case FrameMessageAbortReason.user:
                    counters.addPaymentMethod('result', CompleteReason.Close);
                    break;
            }

            onAbort?.(event.reason);
        });

        paymentFrame.on('success', (event) => {
            const { cardId } = event;

            if (!cardId) {
                counters.addPaymentMethod('result', CompleteReason.Error);
                onError?.('Cannot bind the new added card: empty cardId');

                return;
            }

            counters.addPaymentMethod('result', CompleteReason.Success, cardId);

            onSuccess?.(cardId);
        });
    }, [
        paymentFrame,
        sheet,
        logFirstUserInput,
        onSuccess,
        onError,
        onAbort,
        onReady,
        onSubmit,
        onAuthStart,
        onAuthEnd,
        onVisibilityChange,
    ]);

    const onPaymentFrameSubmit = useCallback(
        () => paymentFrame?.send({ source: 'YandexPay', type: 'submit' }),
        [paymentFrame],
    );

    return (
        <div className={cnBindingForm({ touch: isTouchTemplate() })}>
            <Text className={cnBindingForm('Description')} top="2xs" bottom="xl" align="center">
                {isAuthScreen ? (
                    <React.Fragment>
                        {i18n('Перед оплатой мы сперва спишем у вас и вернём')}
                        <b> 11 ₽</b>, {i18n('нам нужно убедиться что вы владелец карты')}
                    </React.Fragment>
                ) : (
                    i18n(
                        'Добавьте карту в Yandex Pay, чтобы безопасно оплачивать покупки в интернете и сервисах Яндекса',
                    )
                )}
            </Text>

            <div
                className={cnBindingForm('Frame', {
                    auth: isAuthScreen,
                    touch: isTouchTemplate(),
                })}
                ref={frameRef}
            />
            <Row className={cnBindingForm('Footer')} justify="between" top="xl">
                {!newCardWideButton ? (
                    <Row shrink align="center" right="s">
                        <Icon svg={SecureIcon} size="m" />
                        <Text left="s" variant="xs" color="grey" align="left">
                            Protected
                            <br />
                            by Yandex Pay
                        </Text>
                    </Row>
                ) : null}
                <Button
                    className={cnBindingForm('Submit')}
                    disabled={isDisabled || !isCardAllowed}
                    size="l"
                    view={isDisabled || !isCardAllowed ? 'default' : 'action'}
                    pin="round-m"
                    onClick={onPaymentFrameSubmit}
                    amount={newCardWideButton ? totalAmount : undefined}
                    currency={newCardWideButton ? currencyCode : undefined}
                    width={newCardWideButton ? 'max' : undefined}
                >
                    {isCardAllowed
                        ? isDisabled
                            ? i18n('Введите данные')
                            : i18n('Продолжить')
                        : i18n('Карта не поддерживается')}
                </Button>
            </Row>
        </div>
    );
}
