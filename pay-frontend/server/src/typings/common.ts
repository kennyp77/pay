import { express } from '@yandex-int/duffman';

export type CallbackFn0<R = void> = () => R;
export type CallbackFn1<A1 = void, R = void> = (a1: A1) => R;
export type CallbackFn2<A1 = void, A2 = void, R = void> = (a1: A1, a2: A2) => R;

export type YaEnv = 'production' | 'testing' | 'development';

export enum MimeTypes {
    json = 'application/json',
    javascript = 'application/x-javascript',
    html = 'text/html',
    plain = 'text/plain',
}

export type Req = express.Request;
export type Res = express.Response;

export type ExpressHandler = (
    req: express.Request,
    res: express.Response,
    next: (err?: Error) => express.Response,
) => express.Response;

export type AbtExps = {
    flags: Record<string, string | number | boolean>;
    experiments: string; // x-yandex-expboxes-crypted
};

export interface PaymentSheet {
    merchant: {
        id: string;
    };
}

export enum PaymentMethodType {
    Card = 'CARD',
    NewCard = 'NEW_CARD',
    Cash = 'CASH',
    Split = 'SPLIT',
}

export interface PaymentMethod {
    type: PaymentMethodType;
}

export interface FeaturesRule {
    status: {
        public: boolean;
        staff: boolean;
        whitelist: boolean;
        whitelist_users?: string[];
    };
}

export interface Bunker {
    status: {
        active: boolean;
        disabled_in_webview: [
            {
                merchant_id: string;
            },
        ];
    };
    features: {
        split: FeaturesRule & {
            filter: {
                amount_from: number;
                amount_to: number;
            };
        };
    };
}

export interface LaasLocation {
    latitude: number;
    longitude: number;
}
