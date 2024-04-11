import { ButtonType, ButtonTheme, ButtonWidth, ButtonOptions } from '../typings';

export const validateButtonOptions = (options: ButtonOptions): void => {
    const availableButtonTypes = Object.values(ButtonType);
    const availableButtonThemes = Object.values(ButtonTheme);
    const availableButtonWidthValues = Object.values(ButtonWidth);

    if (!availableButtonTypes.includes(options.type)) {
        throw new TypeError(`The "type" value should be one of — ${availableButtonTypes.join(', ')}.`);
    }

    if (!availableButtonThemes.includes(options.theme)) {
        throw new TypeError(`The "theme" value should be one of — ${availableButtonThemes.join(', ')}.`);
    }

    if (!availableButtonWidthValues.includes(options.width)) {
        throw new TypeError(`The "width" value should be one of — ${availableButtonWidthValues.join(', ')}.`);
    }
};

export const getErrorLoggerEnv = (rawErrorLoggerEnv: string): string => {
    const [env] = rawErrorLoggerEnv.split('_');

    return env === 'testing' ? env : 'production';
};
