import { timeEnd, timeStart } from '@trust/rum/light/delta-logger';
import { logError, logFatal } from '@trust/rum/light/error-logger';
import { isInFrame } from '@trust/utils/window';

import { setExperiment } from './abt';
import { RUM_DELTA_NAMES } from './config';
import { toInitPaymentData, assertPaymentDataV3 } from './helpers/payment-sheet';
import { PaymentError } from './lib/errors';
import { counters } from './metrika';
import { CheckoutV3 } from './payment';
import { SdkInitFrame } from './sdk-init-frame';
import { PaymentDataV3, CreateOptions, InnerEventType } from './typings';

export function createCheckout(
    paymentDataV3: PaymentDataV3,
    options?: CreateOptions,
): Promise<CheckoutV3> {
    assertPaymentDataV3(paymentDataV3);

    const paymentData = toInitPaymentData(paymentDataV3);

    if (!paymentData) {
        logFatal(
            'Invalid checkoutSheet',
            new Error(`Invalid sheet: ${JSON.stringify(paymentDataV3)}`),
        );

        return Promise.reject(new Error('Invalid checkoutSheet'));
    }

    timeStart(RUM_DELTA_NAMES.PaymentCreate);
    timeStart(RUM_DELTA_NAMES.ButtonMountFromPaymentCreate);
    timeStart(RUM_DELTA_NAMES.PaymentMethodsShowFromPaymentCreate);
    counters.meta(paymentData, 'checkout-v3', (options || {}).agent);

    return new Promise((resolve, reject) => {
        const frame = SdkInitFrame.getInstance();

        frame.once(InnerEventType.SdkExp, (exp) => setExperiment.fn(exp));

        frame.once(InnerEventType.SdkReady, (event) => {
            const isWebviewFrame = event.isWebview && isInFrame();

            if (event.readyToPay && !isWebviewFrame) {
                const payment = new CheckoutV3(paymentDataV3);

                timeEnd(RUM_DELTA_NAMES.PaymentCreate);
                timeStart(RUM_DELTA_NAMES.ButtonMountFromPaymentResolve);

                resolve(payment);
            } else {
                counters.paymentSkip(paymentData);

                if (event.readyToPay) {
                    counters.webviewWithFrame(paymentData);
                    logError('webview_with_frame');
                }

                reject(new PaymentError('Unable to create payment for user'));
            }
        });

        frame.mountFrame(paymentData);
    });
}
