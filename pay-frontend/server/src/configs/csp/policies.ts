const DATA = 'data:';
const INLINE = "'unsafe-inline'";
const NONE = "'none'";

export const policies = {
    'default-src': [NONE],
    'script-src': ['%nonce%'],
    'style-src': [INLINE], // NB: Из-за user2.desktop компонента
    'img-src': [DATA],
};

export const policiesDev = {
    'default-src': ["'self'"],
    'style-src': [INLINE], // NB: Из-за user2.desktop компонента
    'img-src': [DATA],
};
