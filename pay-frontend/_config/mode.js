const validEnvs = ['production', 'development', 'test'];

const mode = validEnvs.includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'production';

module.exports = {
    name: mode,
    isProduction: mode === 'production',
    isDevelopment: mode === 'development',
    isTesting: mode === 'test',
    withHOT: mode === 'development' && process.env.WEBPACK_HOT === 'true',
    s3Static: process.env.S3_STATIC === 'true',
};
