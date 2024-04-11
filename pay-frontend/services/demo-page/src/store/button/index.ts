import React, { useState, useCallback } from 'react';

import { random } from '@trust/utils/string/random';
import * as Sdk from '@yandex-pay/sdk/src/typings';

import { getButton as getButtonFromUrl, getButtonStyles as getButtonStylesFromUrl } from '../../helpers/data-from-url';

type StyleType = keyof Sdk.ButtonOptions;
type CustomStyleType = 'width' | 'height' | 'border-radius';

export interface ButtonContext {
    style: Sdk.ButtonOptions;
    customStyle: {
        width: number;
        height: number;
        'border-radius': number;
    };
    useCustomStyle: boolean;
    buttonId: string;

    setStyle: Sys.CallbackFn2<StyleType, any>;
    setCustomStyle: Sys.CallbackFn2<CustomStyleType, number>;
    toggleCustom: Sys.CallbackFn0;
    setButtonId: Sys.CallbackFn2<string>;
}

const defaultCustomStyle = {
    width: 250,
    height: 54,
    'border-radius': 8,
};
const customStyle = getButtonStylesFromUrl(defaultCustomStyle);

export const InitialContext: ButtonContext = {
    style: getButtonFromUrl({
        type: Sdk.ButtonType.Pay,
        theme: Sdk.ButtonTheme.Black,
        width: Sdk.ButtonWidth.Max,
    }),
    useCustomStyle: customStyle !== defaultCustomStyle,
    buttonId: random(5),
    customStyle,
    setStyle: () => undefined,
    setCustomStyle: () => undefined,
    toggleCustom: () => undefined,
    setButtonId: () => undefined,
};

export const buttonContext = React.createContext<ButtonContext>(InitialContext);

export function ButtonContextProvider({ children }: { children: JSX.Element }): JSX.Element {
    const [style, setStyleState] = useState(InitialContext.style);
    const [customStyle, setCustomStylesState] = useState(InitialContext.customStyle);
    const [useCustomStyle, setUseCustomStyleState] = useState(InitialContext.useCustomStyle);
    const [buttonId, setButtonIdState] = useState(InitialContext.buttonId);

    const toggleCustom = useCallback(() => setUseCustomStyleState((_val) => !_val), []);

    const setStyle = useCallback((type: StyleType, value: any) => {
        setStyleState((_style) => ({ ..._style, [type]: value }));
    }, []);

    const setCustomStyle = useCallback((type: CustomStyleType, value: number) => {
        setCustomStylesState((_style) => ({ ..._style, [type]: value }));
    }, []);

    const setButtonId = useCallback((value: string) => {
        setButtonIdState(value);
    }, []);

    return React.createElement(
        buttonContext.Provider,
        {
            value: {
                style,
                customStyle,
                useCustomStyle,
                buttonId,

                toggleCustom,
                setStyle,
                setCustomStyle,
                setButtonId,
            },
        },
        children,
    );
}
