import config from '../configs';

export const isProd = config.env === 'production';

export const isTest = config.env === 'testing';

export const isDev = config.env === 'development';
