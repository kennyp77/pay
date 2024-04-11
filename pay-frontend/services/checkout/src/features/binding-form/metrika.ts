import { logError, timeEnd, timeStart } from '@trust/rum';

import { counters } from '../../counters';

enum RUM_DELTA_NAMES {
    BindingFrameLoading = 'binding.frame.loading',
    BindingCreateLoading = 'binding.create.loading',
    BindingCreateLoadingError = 'binding.create.loading.error',
}

export const metrika = {
    _state: '' as 'binding' | 'loading',
    _timeStart: Date.now(),
    startTrackingBinding() {
        counters.addPaymentMethod('init');
        this.startBindingCreateLoading();
        this.startBindingCreateLoadingError();

        this._timeStart = Date.now();
    },
    startBindingCreateLoading() {
        this._state = 'binding';

        timeStart(RUM_DELTA_NAMES.BindingCreateLoading);
    },
    stopBindingCreateLoading() {
        timeEnd(RUM_DELTA_NAMES.BindingCreateLoading);
    },
    startBindingCreateLoadingError() {
        timeStart(RUM_DELTA_NAMES.BindingCreateLoadingError);
    },
    stopBindingCreateLoadingError() {
        timeEnd(RUM_DELTA_NAMES.BindingCreateLoadingError);
    },
    startTrackingFrame() {
        counters.addPaymentMethod('created');
        this.stopBindingCreateLoading();
        this.startFrameLoading();
    },
    startFrameLoading() {
        this._state = 'loading';

        timeStart(RUM_DELTA_NAMES.BindingFrameLoading);
    },
    stopFrameLoading() {
        timeEnd(RUM_DELTA_NAMES.BindingFrameLoading);
    },
    stopFrameLoadingError() {
        timeEnd(RUM_DELTA_NAMES.BindingFrameLoading);
    },
    onCloseTracking() {
        const time = Date.now() - this._timeStart;

        if (this._state === 'binding') {
            logError(new Error('form_close_before_binding'), { time });
        }

        if (this._state === 'loading') {
            logError(new Error('form_close_before_loading'), { time });
        }
    },
    userInputTracking() {
        counters.firstBindingUserInput();
    },
};
