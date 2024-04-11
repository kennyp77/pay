import React, { useState, useCallback } from 'react';

import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import * as Sdk from '@yandex-pay/sdk/src/typings';

import { getScenario as getScenarioFromUrl } from '../../helpers/data-from-url';

import { SUCCESSFUL_PAYMENT, INVALID_MERCHANT_PAYMENT, SHIPPING_VARIANTS } from './data';

const SCENARIOS_DATA = {
    successful: SUCCESSFUL_PAYMENT,
    failure: INVALID_MERCHANT_PAYMENT,
};

type ScenarioId = keyof typeof SCENARIOS_DATA;
type ScenarioData = Sdk.PaymentSheet;
type Sheet = {
    id: ScenarioId;
    version: number;
    data: ScenarioData;
};

interface ScenarioContext {
    scenarios: ScenarioId[];
    sheet: Sheet;
    selectScenario: Sys.CallbackFn1<ScenarioId>;
    replaceSheet: Sys.CallbackFn1<ScenarioData>;
    updateSheet: Sys.CallbackFn1<Partial<ScenarioData>>;

    shipping: {
        activeId: string;
        active: Sdk.ShippingOption[];
        list: Record<string, any>;
    };

    selectShipping: Sys.CallbackFn1<any>;
}

const InitialContext: ScenarioContext = {
    scenarios: Object.keys(SCENARIOS_DATA) as ScenarioId[],
    sheet: {
        id: 'successful',
        version: 0,
        data: getScenarioFromUrl(SCENARIOS_DATA.successful),
    },
    selectScenario: () => undefined,
    replaceSheet: () => undefined,
    updateSheet: () => undefined,

    shipping: {
        activeId: 'label_without_date',
        active: SHIPPING_VARIANTS.label_without_date,
        list: SHIPPING_VARIANTS,
    },

    selectShipping: () => undefined,
};

export const scenarioContext = React.createContext<ScenarioContext>(InitialContext);

export function ScenarioContextProvider({ children }: { children: JSX.Element }): JSX.Element {
    const [scenarios] = useState(InitialContext.scenarios);
    const [sheet, setSheet] = useState(InitialContext.sheet);
    const [shipping, setShipping] = useState(InitialContext.shipping);

    const selectScenario = useCallback(
        (id: ScenarioId) => {
            setSheet((prev) => ({
                id,
                version: prev.version + 1,
                data: SCENARIOS_DATA[id],
            }));
        },
        [setSheet],
    );

    const replaceSheet = useCallback(
        (nextSheet: any) => {
            setSheet((prev) => ({
                ...prev,
                version: prev.version + 1,
                data: nextSheet,
            }));
        },
        [setSheet],
    );

    const updateSheet = useCallback(
        (sheetPatch: any) => {
            setSheet((prev) => ({
                ...prev,
                data: mergeDeep(prev.data, sheetPatch),
            }));
        },
        [setSheet],
    );

    const selectShipping = useCallback(
        (id: string) => {
            setShipping((prev) => ({
                ...prev,
                activeId: id,
                active: prev.list[id] || [],
            }));
        },
        [setShipping],
    );

    return React.createElement(
        scenarioContext.Provider,
        {
            value: {
                scenarios,
                sheet,
                selectScenario,
                replaceSheet,
                updateSheet,
                shipping,
                selectShipping,
            },
        },
        children,
    );
}
