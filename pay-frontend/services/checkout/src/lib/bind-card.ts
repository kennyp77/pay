import TrustSDK, { PaymentFrame } from '@yandex-trust-sdk/base';

import { API_TRUST_SERVICE_TOKEN, API_TRUST_HOST } from '../config';
import { isTouchTemplate } from '../helpers/app';

export type CreateBind = { frame: PaymentFrame; frameSubmit: Sys.CallbackFn0 };

export function createBind(): Promise<CreateBind> {
    const trustSdk = TrustSDK.create({ apiHost: API_TRUST_HOST });

    const sdkBindOptions: Record<string, any> = {
        template: 'binding',
        mode: 'spin',
        isMobile: isTouchTemplate(),
        serviceToken: API_TRUST_SERVICE_TOKEN,
        queryParams: { remote_control: 'true' },
    };

    return trustSdk.bindCard(sdkBindOptions).then((frame) => {
        const frameSubmit = (): void => {
            frame.send({ source: 'YandexPay', type: 'submit' });
        };

        return { frame, frameSubmit };
    });
}
