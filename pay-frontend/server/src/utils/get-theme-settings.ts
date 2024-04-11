import config from '../configs';
import { QUERY_KEY } from '../constants';
import { getMerchantId } from '../routes/helpers/payment-sheet';
import WebCore from '../routes/helpers/web-core';
import { IThemeSettings } from '../typings/theme';

export function getThemeSettings(core: WebCore): IThemeSettings {
    const { monochromeBackgroundMerchantIds } = config;
    let merchantId = '';
    try {
        const payData = JSON.parse(core.req.query[QUERY_KEY]);
        merchantId = getMerchantId(payData.payload.sheet);
    } catch (error) {
        core.logger.error('Get theme settings error', {
            message: error.message || error,
            stack: error.stack,
            query: core.req.query,
        });
    }
    const monochromeBackground = monochromeBackgroundMerchantIds.includes(merchantId);

    return {
        monochromeBackground,
    };
}
