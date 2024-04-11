import { YAPAY_MESSAGE_SOURCE, YAPAY_MESSAGE_TYPE } from '../config';
import { MerchantDataMessage } from '../typings';

export const toMerchantDataMessage = ({
    merchantId,
    merchantName,
    keyId,
    keyValue,
}: {
    merchantId: string;
    merchantName: string;
    keyId: string;
    keyValue: string;
}): MerchantDataMessage => {
    return {
        source: YAPAY_MESSAGE_SOURCE,
        type: YAPAY_MESSAGE_TYPE,
        merchant_id: merchantId,
        merchant_name: merchantName,
        key_id: keyId,
        key_value: keyValue,
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

export const validateData = (
    merchantDomains: string[],
    merchantName: string,
    encCreds: string,
    pspId: string,
) => {
    const { error, message } = validateMerchant(merchantDomains, merchantName);

    if (!error) {
        if (!encCreds) {
            return {
                error: true,
                message: 'Creds is required',
            };
        }

        if (!pspId) {
            return {
                error: true,
                message: 'Param "psp_id" is required',
            };
        }

        return { error: false };
    }

    return { error, message };
};
