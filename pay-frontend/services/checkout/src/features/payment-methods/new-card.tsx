import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';

import { cn } from '@bem-react/classname';
import once from '@tinkoff/utils/function/once';
import { logError, timeStart, timeEnd } from '@trust/rum';
import { CardSystem, getCardSystem } from '@trust/utils/cards';
import { dom } from '@trust/utils/dom';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Block } from '../../components/block';
import { Button } from '../../components/button';
import { ErrorBase } from '../../components/error-base';
import { Loader } from '../../components/loader';
import { Panel, PanelHeader } from '../../components/panel';
import { Text } from '../../components/text';
import { counters } from '../../counters';
import { isTouchTemplate } from '../../helpers/app';
import { preloaderDescriptionsMap } from '../../helpers/binding';
import { checkIsCardAllowed } from '../../helpers/user-card';
import { createBind, CreateBind } from '../../lib/bind-card';
import { history, Path } from '../../router';
import { getSheet, getTotalAmount, getCurrencyCode } from '../../store/payment';
import { selectBindedCard } from '../../store/payment-methods';
import { AppPendingReason, CompleteReason } from '../../typings';

import './new-card.scss';

interface CardAllowed {
    isCardAllowed: boolean;
    cardSystem?: CardSystem;
}

interface BindError {
    status: boolean;
    reason?: string;
}

interface BindPending {
    status: boolean;
    reason?: string;
}

enum RUM_DELTA_NAMES {
    BindingFrameLoading = 'binding.frame.loading',
    BindingCreateLoading = 'binding.create.loading',
    BindingCreateLoadingError = 'binding.create.loading.error',
}

let TRACKING_STATE = '';
let TRACKING_TIME_START = 0;

const startTrackingBinding = (): void => {
    counters.addPaymentMethod('init');
    timeStart(RUM_DELTA_NAMES.BindingCreateLoading);
    timeStart(RUM_DELTA_NAMES.BindingCreateLoadingError);
    TRACKING_TIME_START = Date.now();
    TRACKING_STATE = 'binding';
};

const startTrackingFrameLoading = (): void => {
    counters.addPaymentMethod('created');
    timeEnd(RUM_DELTA_NAMES.BindingCreateLoading);
    timeStart(RUM_DELTA_NAMES.BindingFrameLoading);
    TRACKING_STATE = 'loading';
};

const stopTracking = (state?: string): void => {
    if (state) {
        TRACKING_STATE = state;
    }

    if (TRACKING_STATE === 'binding') {
        timeEnd(RUM_DELTA_NAMES.BindingCreateLoading);
    }
    if (TRACKING_STATE === 'loading') {
        timeEnd(RUM_DELTA_NAMES.BindingFrameLoading);
    }
    if (TRACKING_STATE === 'error') {
        timeEnd(RUM_DELTA_NAMES.BindingCreateLoadingError);
    }
    TRACKING_STATE = '';
};

const onCloseTracking = (): void => {
    const time = Date.now() - TRACKING_TIME_START;

    if (TRACKING_STATE === 'binding') {
        logError(new Error('form_close_before_binding'), { time });
    }
    if (TRACKING_STATE === 'loading') {
        logError(new Error('form_close_before_loading'), { time });
    }
};

const userInputTracking = (): void => {
    counters.firstBindingUserInput();
};

export const cnPaymentNewCard = cn('PaymentNewCard');

const i18n = (v: string) => v;

export const PaymentNewCard = (): JSX.Element => {
    const frameRef = useRef<HTMLDivElement>(null);

    const [{ frame, frameSubmit }, setFrame] = useState<CreateBind>({} as CreateBind);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isAuthScreen, setIsAuthScreen] = useState(true);
    const [isFrameMounted, setFrametIsMounted] = useState(false);
    const [{ isCardAllowed, cardSystem }, setCard] = useState<CardAllowed>({ isCardAllowed: true });
    const [bindError, setBindError] = useState<BindError>({ status: false });
    const [bindPending, setBindPending] = useState<BindPending>({
        status: true,
        reason: AppPendingReason.CardBindingFormLoading,
    });

    const sheet = useSelector(getSheet);
    const totalAmount = useSelector(getTotalAmount);
    const currencyCode = useSelector(getCurrencyCode);

    const selectBindedCardFn = useService(selectBindedCard);

    const onError = useCallback((reason?: string) => {
        stopTracking('error');

        logError(`ErrorOnBind (${reason})`);

        setBindPending({ status: false });
        setBindError({ status: true, reason });
    }, []);

    const onClickSubmit = useCallback(() => {
        if (frameSubmit) {
            frameSubmit();
        }
    }, [frameSubmit]);

    // TODO onClose
    // counters.addPaymentMethod('result', CompleteReason.Close);

    const onClickAddAgain = useCallback(() => {
        setBindPending({ status: true, reason: AppPendingReason.CardBindingFormLoading });

        setFrame({} as CreateBind);
        setBindError({ status: false });

        startTrackingBinding();

        createBind()
            .then(setFrame)
            .then(startTrackingFrameLoading)
            .catch(() => onError('add_again'));
    }, []);

    const logFirstUserInput = useMemo(() => once(userInputTracking), [frame]);

    useEffect(() => {
        const offFnList = [
            dom.on(window, 'beforeunload', onCloseTracking),
            dom.on(window, 'unload', onCloseTracking),
        ];

        startTrackingBinding();

        let isActive = true;

        createBind()
            .then((data) => {
                if (isActive) {
                    setFrame(data);
                }
            })
            .catch(() => {
                if (isActive) {
                    onError('init');
                }
            });

        return () => {
            isActive = false;

            offFnList.forEach((offFn) => offFn());
        };
    }, []);

    useEffect(() => {
        if (isFrameMounted) {
            return;
        }

        if (frame && frameRef.current) {
            frame.mount(frameRef.current);
            setFrametIsMounted(true);

            return (): void => {
                frame.unmount();
                setFrametIsMounted(false);
            };
        }

        return (): void => undefined;
    }, [frame, frameRef.current]);

    useEffect(() => {
        if (frame) {
            frame.on('form-ready', () => {
                counters.addPaymentMethod('loaded');
                stopTracking();

                setBindPending({ status: false });
                setIsAuthScreen(false);
            });

            frame.on('form-status', (event) => {
                logFirstUserInput();

                const canSubmit = Boolean(event.data.canSubmit);

                let cardSystemInfo = event.data.cardSystem;

                if (canSubmit) {
                    counters.bindingCanSubmit();

                    if (!cardSystemInfo) {
                        cardSystemInfo = CardSystem.Unknown;
                    }
                }

                setCard({
                    isCardAllowed: checkIsCardAllowed(sheet, cardSystemInfo),
                    cardSystem: getCardSystem(cardSystemInfo),
                });

                setIsDisabled(!canSubmit);
            });

            frame.on('form-submit', () => {
                counters.addPaymentMethod('sent');
                setBindPending({ status: true, reason: AppPendingReason.CardBinding });
                setIsDisabled(true);
            });

            frame.on('auth-start', () => {
                counters.addPaymentMethod('3ds');
                setBindPending({ status: false });
                setIsAuthScreen(true);
            });

            frame.on('auth-end', () => {
                setBindPending({ status: true, reason: AppPendingReason.CardBinding });
                setIsAuthScreen(false);
            });

            frame.on('error', (event) => {
                counters.addPaymentMethod('result', CompleteReason.Error);
                onError(event.reason);
            });

            frame.on('abort', () => {
                counters.addPaymentMethod('result', CompleteReason.Close);

                setBindPending({ status: false });
                // TODO: обработка ошибки
            });

            frame.on('success', (event) => {
                const { cardId: trustCardId } = event;

                if (!trustCardId) {
                    counters.addPaymentMethod('result', CompleteReason.Error);
                    onError('Cannot bind the new added card');

                    return;
                }

                counters.addPaymentMethod('result', CompleteReason.Success, trustCardId);

                selectBindedCardFn(trustCardId, () => history.push(Path.Checkout));
            });
        }
    }, [frame]);

    return (
        <Panel
            header={<PanelHeader title="Оплата новой картой" closeHref={Path.Main} />}
            footer={
                <Button
                    disabled={isDisabled || !isCardAllowed}
                    width="max"
                    size="l"
                    view="action"
                    variant="primary"
                    pin="round-m"
                    amount={totalAmount}
                    currency={currencyCode}
                    onClick={onClickSubmit}
                >
                    {isCardAllowed ? i18n('Оплатить') : i18n('Карта не поддерживается')}
                </Button>
            }
        >
            <Block className={cnPaymentNewCard()}>
                <div
                    className={cnPaymentNewCard('content', {
                        auth: isAuthScreen,
                        touch: isTouchTemplate(),
                    })}
                    ref={frameRef}
                />
            </Block>

            <Loader progress={bindPending.status} fill="white" position="center" size="l">
                <Text align="center" top="m">
                    {(bindPending.reason && preloaderDescriptionsMap[bindPending.reason]) || ''}
                </Text>
            </Loader>

            {bindError.status && (
                <Block bg="white" className={cnPaymentNewCard('Error')}>
                    <ErrorBase
                        description={bindError.reason}
                        action={onClickAddAgain}
                        actionText="Повторить"
                    />
                </Block>
            )}
        </Panel>
    );
};
