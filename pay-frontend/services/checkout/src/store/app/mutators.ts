import { createService } from '@yandex-pay/react-services';
import { produce } from 'immer';

import { RootState } from '..';
import { getIsFullOnboarded } from '../../helpers/onboarding';
import { Path } from '../../router';
import { AppScreen, AppPending, AppError, AppErrorReason } from '../../typings';

export const setScreen = createService<RootState, [AppScreen]>(({ getState, setState }, screen) => {
    setState(
        produce(getState(), (draft) => {
            draft.app.screen = screen;
        }),
    );
});

export const setUserState = createService<RootState, [Checkout.UserState]>(
    ({ getState, setState }, userState) => {
        setState(
            produce(getState(), (draft) => {
                draft.app.userState = userState;
            }),
        );
    },
);

export const setObSteps = createService<RootState, [Checkout.ObSteps]>(
    ({ getState, setState }, obSteps) => {
        setState(
            produce(getState(), (draft) => {
                draft.app.obSteps = obSteps;
            }),
        );
    },
);

export const setCurrentObStep = createService<RootState, [number]>(
    ({ getState, setState }, step) => {
        setState(
            produce(getState(), (draft) => {
                draft.app.obCurrentStep = step;
            }),
        );
    },
);

export const setObStepOnboarded = createService<RootState, ['address' | 'contact' | 'pickup']>(
    ({ getState, setState }, step) => {
        setState(
            produce(getState(), (draft) => {
                switch (step) {
                    case 'address': {
                        draft.app.obSteps.addressOnboarded = true;

                        break;
                    }
                    case 'contact': {
                        draft.app.obSteps.contactOnboarded = true;

                        break;
                    }
                    case 'pickup': {
                        draft.app.obSteps.pickupOnboarded = true;

                        break;
                    }
                }

                if (getIsFullOnboarded(draft.app.obSteps)) {
                    draft.app.obSteps.active = false;
                }
            }),
        );
    },
);

export const setPendingScreen = createService<RootState, [AppPending | void]>(
    ({ getState, setState }, pending) => {
        setState(
            produce(getState(), (draft) => {
                draft.app.pending = pending || undefined;
            }),
        );
    },
);

export const resetPendingScreen = () => setPendingScreen();

export const setErrorScreen = createService<RootState, [AppError | void]>(
    ({ getState, setState }, error) => {
        setState(
            produce(getState(), (draft) => {
                if (error) {
                    draft.app.error.push(error);
                } else {
                    draft.app.error.shift();
                }
            }),
        );
    },
);

export const setErrorScreenWithClose = createService<RootState, [AppError]>(
    async ({ dispatch }, error) => {
        await dispatch(
            setErrorScreen({
                reason: error.reason,
                message: error.message || 'Ошибка',
                description: error.description,
                action: () => {
                    dispatch(resetErrorScreen());
                    if (error.action) {
                        error.action();
                    }
                },
                actionText: error.actionText || 'Повторить',
            }),
        );
    },
);

export const setErrorScreenWithBack = createService<RootState, [AppError]>(
    async ({ dispatch }, error) => {
        await dispatch(
            setErrorScreen({
                reason: error.reason,
                message: error.message || 'Ошибка',
                description: error.description,
                action: () => {
                    if (error.action) {
                        error.action();
                    }
                },
                useActionButton: true,
                actionText: error.actionText || 'Вернуться в магазин',
            }),
        );
    },
);

export const setErrorScreenWithRefresh = createService<RootState, [AppError]>(
    async ({ dispatch }, error) => {
        await dispatch(
            setErrorScreen({
                reason: error.reason,
                message: error.message || 'Ошибка',
                description: error.description,
                action: async () => {
                    // TODO: при большом урле браузер перестаёт отркывать сайт с ошибкой 431
                    window.location.href = Path.Main;

                    if (error.action) {
                        await error.action();
                    }
                },
                actionText: error.actionText || 'Обновить страницу',
            }),
        );
    },
);

export const resetErrorScreen = () => setErrorScreen();

export const resetInitialLoader = createService<RootState, [boolean?]>(
    ({ getState, setState }, loading = false) => {
        setState(
            produce(getState(), (draft) => {
                draft.app.initialLoading = loading;
            }),
        );
    },
);
