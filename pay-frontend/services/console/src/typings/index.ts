import { YAPAY_MESSAGE_TYPE } from '../config';

export interface MerchantDataMessage {
    source: string;
    type: typeof YAPAY_MESSAGE_TYPE;
    merchant_id: string;
    merchant_name: string;
}
