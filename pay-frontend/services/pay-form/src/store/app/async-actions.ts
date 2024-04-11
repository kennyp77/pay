import { logError } from '@trust/rum';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { CHALLENGE_CARD_ID, CHALLENGE_NUM } from '../../config';
import { counters } from '../../counters/metrika';
import { errorReason, errorDetails } from '../../helpers/api-error';
import { pingOpener } from '../../helpers/ping';
import { FormConnection } from '../../lib/intercom';
import { AppScreen } from '../../typings';
import { State } from '../index';
import { checkoutAction, waitForSheetAction } from '../payment/async-actions';
import {
    loadCashbackAction,
    loadUserStateAction,
    redirectToNewCardAction,
    refreshPaymentMethodsAction,
    setActivePaymentMethodAction,
} from '../user/async-actions';
import { getActivePaymentMethod, getFirstPaymentMethod, getSavedUserCard } from '../user/selectors';

import { setErrorAction, setScreenAction } from './actions';

export const redirectToAction =
    (screen: AppScreen) =>
    async (dispatch: ThunkDispatch<State, never, Action>): Promise<void> => {
        dispatch(setScreenAction(screen));
    };

export const initializeAction =
    () =>
    async (dispatch: ThunkDispatch<State, never, Action>, getState: () => State): Promise<void> => {
        pingOpener().catch(() => {
            counters.formLosed({ from: 'initialize' });
            logError('Form losed (from initialize)');
        });

        const adapter = FormConnection.getInstance();

        try {
            await Promise.all([dispatch(waitForSheetAction()), dispatch(loadUserStateAction())]);

            // не нужен await, т.к. можно загружать асинхронно, по порядку не важно
            dispatch(loadCashbackAction(getSavedUserCard(getState())));

            await dispatch(refreshPaymentMethodsAction());
            await dispatch(
                setActivePaymentMethodAction(getFirstPaymentMethod(getState()), { skipSave: true }),
            );

            const activePaymentMethod = getActivePaymentMethod(getState());

            if (activePaymentMethod?.disabled) {
                dispatch(redirectToNewCardAction());
            }

            counters.formReady();

            if (CHALLENGE_NUM > 0 && CHALLENGE_CARD_ID) {
                counters.immediateCheckout();
                // Проводим платёж с id карты, которая была выбрана до редиректа на валидацию
                dispatch(checkoutAction(CHALLENGE_CARD_ID));
            }
        } catch (error) {
            logError(error, { fn: 'initializeAction' });

            counters.paymentError({
                state: 'load_initial_data',
                message: error.message,
            });

            dispatch(redirectToAction(AppScreen.InitializationError));
            dispatch(
                setErrorAction({
                    description: 'Произошла ошибки при инициализации формы',
                    action: () => adapter.formError(errorReason(error), errorDetails(error)),
                    actionText: 'Вернуться в магазин',
                }),
            );
        }
    };
