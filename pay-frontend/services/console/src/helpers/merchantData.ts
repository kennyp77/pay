import { YAPAY_MESSAGE_SOURCE, YAPAY_MESSAGE_TYPE } from '../config';
import { MerchantDataMessage } from '../typings';

export const toMerchantDataMessage = ({
    merchantId,
    merchantName,
}: {
    merchantId: string;
    merchantName: string;
}): MerchantDataMessage => {
    return {
        source: YAPAY_MESSAGE_SOURCE,
        type: YAPAY_MESSAGE_TYPE,
        merchant_id: merchantId,
        merchant_name: merchantName,
    };
};

const domainRegExp = /^http[s]{0,1}:\/\/.*\..+$/;

export const validateMerchant = (merchantDomains: string[], merchantName: string) => {
    if (!merchantName) {
        return {
            error: true,
            message: 'Param "name" is required',
        };
    }

    if (!merchantDomains || merchantDomains.length === 0) {
        return {
            error: true,
            message: 'Param "domains" is required',
        };
    }

    if (!merchantDomains.every((domain) => domainRegExp.test(domain))) {
        return {
            error: true,
            message: 'Domains are incorrect',
        };
    }

    return {
        error: false,
    };
};
