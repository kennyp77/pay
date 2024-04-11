const SUPPORTED_BROWSERS = [
    'ff >= 64',
    'Chrome >= 67',
    'Opera >= 60',
    'Safari >= 12',
    'Edge >= 18',
    'Android >= 6',
    'ios_saf >= 10',
    'op_mob >= 56',
    'and_chr >= 67',
    'and_uc >= 13',
    'Samsung >= 10',
];

const UNSUPPORTED_BROWSERS = [
    'ff < 64',
    'Chrome < 67',
    'Opera < 60',
    'Safari < 12',
    'ie <= 11',
    'ie_mob <= 11',
    'Edge < 18',
    'Android < 6',
    'ios_saf < 10',
    'op_mob < 56',
    'and_chr < 67',
    'and_uc < 13',
    'Samsung < 10',
];

module.exports = {
    SUPPORTED_BROWSERS,
    UNSUPPORTED_BROWSERS,
};
