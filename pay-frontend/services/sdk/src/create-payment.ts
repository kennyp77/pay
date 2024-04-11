import { timeEnd, timeStart } from '@trust/rum/light/delta-logger';
import { logError, logFatal, logInfo } from '@trust/rum/light/error-logger';
import { isInFrame } from '@trust/utils/window';

import { setExperiment } from './abt';
import { RUM_DELTA_NAMES } from './config';
import { DeprecatedButton } from './deprecated/button';
import {
    isV3PaymentData,
    isInitPaymentDataWithCheckout,
    assertPaymentDataV3,
    toInitPaymentData,
} from './helpers/payment-sheet';
import { PaymentError } from './lib/errors';
import { counters } from './metrika';
import { PaymentV3, Payment, Checkout } from './payment';
import { SdkInitFrame } from './sdk-init-frame';
import { SdkInitSpeedup } from './sdk-init-speedup';
import {
    InitPaymentData,
    PaymentDataV3,
    InnerEventType,
    CreateOptions,
    PaymentType,
} from './typings';

let sdkInitCounted = false;
timeStart(RUM_DELTA_NAMES.PaymentCreateFromSdkInit);
timeStart(RUM_DELTA_NAMES.PaymentCreateFromSdkInitSpeedup);

const speedupFrame = SdkInitSpeedup.getInstance();
speedupFrame.once(InnerEventType.SdkReadyExp, () => {
    timeEnd(RUM_DELTA_NAMES.PaymentCreateFromSdkInitSpeedup);
    timeStart(RUM_DELTA_NAMES.PaymentCreateInitDiff);
});

function finishCount(): void {
    if (!sdkInitCounted) {
        timeEnd(RUM_DELTA_NAMES.PaymentCreateFromSdkInit);
        sdkInitCounted = true;
    }
}

// YANDEXPAY-3905
function checkIsInFrame(): void {
    if (isInFrame()) {
        logInfo('Payment created in iFrame');
    }
}

function getPaymentType(rawPaymentData: InitPaymentData | PaymentDataV3): PaymentType {
    if (isV3PaymentData(rawPaymentData)) {
        return 'payment-v3';
    }

    return isInitPaymentDataWithCheckout(rawPaymentData) ? 'checkout' : 'payment';
}

function getInitPaymentData(rawPaymentData: InitPaymentData | PaymentDataV3): InitPaymentData {
    if (isV3PaymentData(rawPaymentData)) {
        return toInitPaymentData(rawPaymentData);
    }

    return rawPaymentData;
}

function getPayment(rawPaymentData: InitPaymentData | PaymentDataV3): PaymentV3 {
    if (isV3PaymentData(rawPaymentData)) {
        return new PaymentV3(rawPaymentData);
    }

    if (isInitPaymentDataWithCheckout(rawPaymentData)) {
        return new Checkout(rawPaymentData);
    }

    return new Payment(rawPaymentData);
}

export function createPayment(
    rawPaymentData: InitPaymentData | PaymentDataV3,
    options?: CreateOptions,
): Promise<PaymentV3> {
    // YANDEXPAY-3472
    finishCount();
    checkIsInFrame();

    assertPaymentDataV3(rawPaymentData);

    const paymentType = getPaymentType(rawPaymentData);
    const paymentData = getInitPaymentData(rawPaymentData);

    if (!paymentData) {
        logFatal(
            'Invalid paymentSheet',
            new Error(`Invalid sheet: ${JSON.stringify(rawPaymentData)}`),
        );

        return Promise.reject(new Error('Invalid paymentSheet'));
    }

    timeStart(RUM_DELTA_NAMES.PaymentCreate);
    timeStart(RUM_DELTA_NAMES.ButtonMountFromPaymentCreate);
    timeStart(RUM_DELTA_NAMES.PaymentMethodsShowFromPaymentCreate);
    counters.meta(paymentData, paymentType, (options || {}).agent);

    return new Promise((resolve, reject) => {
        const frame = SdkInitFrame.getInstance();

        frame.once(InnerEventType.SdkExp, (exp) => setExperiment.fn(exp));

        frame.once(InnerEventType.SdkReady, (event) => {
            const isWebviewFrame = event.isWebview && isInFrame();

            if (event.readyToPay && !isWebviewFrame) {
                const payment = getPayment(rawPaymentData);

                /**
                 * The Hack for the DeprecatedButton support.
                 */
                DeprecatedButton.setPayment(payment);
                timeEnd(RUM_DELTA_NAMES.PaymentCreate);
                timeEnd(RUM_DELTA_NAMES.PaymentCreateInitDiff);
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
