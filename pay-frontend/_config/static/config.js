const getEnv = require('../env');

module.exports = {
    BUCKET: 'pay-static',
    USE_YASTATIC: true,
    PUBLIC_URL: true,
    RELEASE_TYPE: getEnv('RELEASE_TYPE', 'release'), // NB: Задается в Dockerfile
};
