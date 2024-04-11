import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';

import once from '@tinkoff/utils/function/once';
import { logError, timeStart, timeEnd } from '@trust/rum';
import BindCardError from '@trust/ui/components/bind-card-error';
import BindCardFrame from '@trust/ui/components/bind-card-frame';
import { CardSystem, getCardSystem } from '@trust/utils/cards';
import { dom } from '@trust/utils/dom';
import { useSelector } from 'react-redux';

import { counters } from '../counters/metrika';
import { checkIsCardAllowed } from '../helpers/user-card';
import { useAction } from '../hooks/use-action';
import { createBind, CreateBind } from '../lib/bind-card';
import { setPendingAction, resetPendingAction } from '../store/app/actions';
import { redirectToAction } from '../store/app/async-actions';
import { getSheet } from '../store/payment/selectors';
import { selectBindedPaymentMethodAction } from '../store/user/async-actions';
import { getPaymentMethods } from '../store/user/selectors';
import { AppScreen, AppPending, CompleteReason } from '../typings';

interface CardAllowed {
    isCardAllowed: boolean;
    cardSystem?: CardSystem;
}

interface BindError {
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

export default function BindCardContainer(): JSX.Element {
    const frameRef = useRef<HTMLDivElement>();

    const [{ frame, frameSubmit }, setFrame] = useState<CreateBind>({} as CreateBind);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isAuthScreen, setIsAuthScreen] = useState(true);
    const [{ isCardAllowed, cardSystem }, setCard] = useState<CardAllowed>({ isCardAllowed: true });
    const [bindError, setBindError] = useState<BindError>({ status: false });

    const methods = useSelector(getPaymentMethods);
    const sheet = useSelector(getSheet);
    const hasSeveralMethods = methods.length > 1;

    const redirectTo = useAction(redirectToAction);
    const setPending = useAction(setPendingAction);
    const resetPending = useAction(resetPendingAction);
    const selectBindedPaymentMethod = useAction(selectBindedPaymentMethodAction);

    const onError = useCallback((reason?: string) => {
        stopTracking('error');

        logError(`ErrorOnBind (${reason})`);

        resetPending();
        setBindError({ status: true, reason });
    }, []);

    const onClickSubmit = useCallback(() => {
        if (frameSubmit) {
            frameSubmit();
        }
    }, [frameSubmit]);

    const onClickBack = useCallback(() => {
        counters.addPaymentMethod('result', CompleteReason.Close);

        resetPending();
        redirectTo(AppScreen.PaymentMethods);
    }, []);

    const onClickAddAgain = useCallback(() => {
        setPending(AppPending.CardBindingFormLoading);

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

        createBind()
            .then(setFrame)
            .then(startTrackingFrameLoading)
            .catch(() => onError('init'));

        return (): void => offFnList.forEach((offFn) => offFn());
    }, []);

    useEffect(() => {
        if (frame && frameRef.current) {
            frame.mount(frameRef.current);

            return (): void => frame.unmount();
        }

        return (): void => null;
    }, [frame, frameRef.current]);

    useEffect(() => {
        if (frame) {
            frame.on('form-ready', () => {
                counters.addPaymentMethod('loaded');
                stopTracking();

                resetPending();
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
                setPending(AppPending.CardBinding);
                setIsDisabled(true);
            });

            frame.on('auth-start', () => {
                counters.addPaymentMethod('3ds');
                resetPending();
                setIsAuthScreen(true);
            });

            frame.on('auth-end', () => {
                setPending(AppPending.CardBinding);
                setIsAuthScreen(false);
            });

            frame.on('error', (event) => {
                counters.addPaymentMethod('result', CompleteReason.Error);

                onError(event.reason);
            });

            frame.on('abort', () => {
                counters.addPaymentMethod('result', CompleteReason.Close);

                resetPending();
                redirectTo(AppScreen.PaymentMethods);
            });

            frame.on('success', (event) => {
                const { cardId } = event;

                if (!cardId) {
                    counters.addPaymentMethod('result', CompleteReason.Error);
                    onError('Cannot bind the new added card');

                    return;
                }

                counters.addPaymentMethod('result', CompleteReason.Success, event.cardId);
                selectBindedPaymentMethod(cardId);
            });
        }
    }, [frame]);

    if (bindError.status) {
        return (
            <BindCardError
                status={bindError.reason}
                onClickBack={hasSeveralMethods ? onClickBack : null}
                onClickAdd={onClickAddAgain}
            />
        );
    }

    return (
        <BindCardFrame
            frameRef={frameRef}
            isCardAllowed={isCardAllowed}
            cardSystem={cardSystem}
            isAuthScreen={isAuthScreen}
            onClickBack={hasSeveralMethods ? onClickBack : null}
            onClickSubmit={isDisabled ? null : onClickSubmit}
        />
    );
}
