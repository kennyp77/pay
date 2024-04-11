import pathOr from '@tinkoff/utils/object/pathOr';

type IconData = {
    full: {
        light: string;
    };
    short: {
        light: string;
        dark: string;
        mono: string;
    };
};

export const ISSUERS: string[] = [
    'akbars',
    'alfa',
    'atb',
    'avangard',
    'belarusbank',
    'belinvestbank',
    'bin',
    'citibank',
    'crediteuropa',
    'gaz',
    'home-credit-bank',
    'kaspibank',
    'levoberezhny',
    'minbank',
    'modulbank',
    'moscow',
    'mtb',
    'mts',
    'novikombank',
    'open',
    'opt',
    'orient',
    'pochta-bank',
    'priorbank',
    'psb',
    'qazkom',
    'qiwi',
    'raif',
    'raundbank',
    'rencredit',
    'rnkb',
    'rost',
    'russ',
    'sber',
    'selh',
    'skb',
    'sovk',
    'spb',
    'standart',
    'swedbank',
    'tinkoff',
    'uni',
    'uralbank',
    'uralsib',
    'vbank',
    'vbrr',
    'vtb',
    'yoomoney',
];

const ICONS: Record<string, IconData> = ISSUERS.reduce((res, issuer) => {
    res[issuer] = {
        full: {
            light: require(`./assets/${issuer}/${issuer}-full-light.svg`),
        },
        short: {
            light: require(`./assets/${issuer}/${issuer}-short-light.svg`),
            dark: require(`./assets/${issuer}/${issuer}-short-dark.svg`),
            mono: require(`./assets/${issuer}/${issuer}-short-mono.svg`),
        },
    };

    return res;
}, {} as Record<string, IconData>);

export function getIcon(issuer: string, variant: string, theme: string): any {
    return pathOr([issuer, variant, theme], '', ICONS);
}
