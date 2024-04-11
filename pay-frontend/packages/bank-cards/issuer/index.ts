import toLower from '@tinkoff/utils/string/toLower';
import toString from '@tinkoff/utils/string/toString';

import { CardIssuer } from '../typings';

export { CardIssuer };

const toId = (str: string): string => toLower(toString(str)).replace(/[^a-zA-Z]/g, '');

type CardIssuerMap = Record<string, CardIssuer>;

const ISSUER_MAP: CardIssuerMap = Object.values(CardIssuer).reduce((res, issuerValue) => {
    res[toId(issuerValue)] = issuerValue as CardIssuer;

    return res;
}, {} as CardIssuerMap);

export const getCardIssuer = (issuer: string): CardIssuer => {
    return ISSUER_MAP[toId(issuer)] || CardIssuer.Unknown;
};

export function getPan4(number: string): string {
    return number.substr(-4);
}

export function getPanMask(): string {
    return '\u2022\u2022\u2022\u2022';
}
