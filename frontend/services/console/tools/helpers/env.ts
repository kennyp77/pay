process.env.YENV = process.env.NODE_ENV;

export const isProduction = process.env.YENV === 'production';
export const isTesting = process.env.YENV === 'testing';
export const isDevelopment = process.env.YENV === 'development';
