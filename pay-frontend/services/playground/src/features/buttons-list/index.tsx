import * as React from 'react';
import { Dispatch, useMemo } from 'react';

import { ButtonTheme, ButtonType } from '@yandex-pay/sdk/src/typings';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Toggle } from 'components/toggle';
import { addEach, combineMaps } from 'helpers/objects-utils';

import { ButtonSize } from '../../components/button-size/button-size';

import { AdditionalOption, AppearanceMetadata, YandexPayCustomAppearance } from './custom-button';

// @ts-ignore
const buttonTypesPersonal: {
    type: ButtonType;
    showCard: boolean;
    showAvatar: boolean;
}[] = combineMaps({
    type: Object.values(ButtonType),
    showCard: [true, false],
    showAvatar: [true, false],
});

const buttonThemes = [ButtonTheme.Black, ButtonTheme.White, ButtonTheme.WhiteOutlined];

interface CustomButtonsWrapperProps {
    additionalOption: AdditionalOption;
    fall: boolean;
}

const { YaPay } = window;

export const CustomButtonsWrapper = ({ additionalOption, fall }: CustomButtonsWrapperProps) => {
    const buttons: AppearanceMetadata[] = useMemo(() => {
        if (fall) {
            return addEach(
                addEach(buttonTypesPersonal, 'additionalOption', additionalOption),
                'extra',
                'fall',
            ) as unknown as AppearanceMetadata[];
        }

        return addEach(
            buttonTypesPersonal,
            'additionalOption',
            additionalOption,
        ) as unknown as AppearanceMetadata[];
    }, [additionalOption, fall]);

    if (!YaPay) {
        console.error('no YaPay in window');

        return null;
    }

    const billsAppearance: AppearanceMetadata = {
        additionalOption,
        showAvatar: true,
        showCard: true,
        theme: ButtonTheme.Yellow,
        type: ButtonType.Pay,
        extra: fall ? 'fall' : 'bills',
    };

    return (
        <React.Fragment>
            {buttonThemes.map((theme) => (
                <Panel
                    caption={theme}
                    key={theme}
                    panelTheme={
                        [ButtonTheme.WhiteOutlined, ButtonTheme.Black].includes(theme)
                            ? 'light'
                            : 'dark'
                    }
                >
                    {addEach(buttons, 'theme', theme).map((btnProps, idx) => (
                        <YandexPayCustomAppearance
                            appearanceMetadata={btnProps as unknown as AppearanceMetadata}
                            YaPay={YaPay}
                            key={`${theme}-${idx}`}
                        />
                    ))}
                    {theme === ButtonTheme.Yellow ? (
                        <YandexPayCustomAppearance
                            appearanceMetadata={billsAppearance}
                            YaPay={YaPay}
                            key="bills"
                        />
                    ) : null}
                </Panel>
            ))}
        </React.Fragment>
    );
};

export interface CustomButtonsSettingsProps {
    setAdditionalOptionCashback: Dispatch<boolean>;
    additionalOptionCashback: boolean;
    setAdditionalOptionSplit: Dispatch<boolean>;
    additionalOptionSplit: boolean;
    setAdditionalOptionFall: Dispatch<boolean>;
    additionalOptionFall: boolean;
}

export const CustomButtonsSettings = ({
    setAdditionalOptionCashback,
    additionalOptionCashback,
    setAdditionalOptionSplit,
    additionalOptionSplit,
    setAdditionalOptionFall,
    additionalOptionFall,
}: CustomButtonsSettingsProps) => {
    return (
        <Panel caption="Настройки">
            <PanelOption label="Cashback">
                <Toggle
                    name="cashback"
                    checked={additionalOptionCashback}
                    onChange={setAdditionalOptionCashback}
                />
            </PanelOption>

            <PanelOption label="Split">
                <Toggle
                    name="split"
                    checked={additionalOptionSplit}
                    onChange={setAdditionalOptionSplit}
                />
            </PanelOption>

            <PanelOption label="Fall (!)">
                <Toggle
                    name="fall"
                    checked={additionalOptionFall}
                    onChange={setAdditionalOptionFall}
                />
            </PanelOption>

            <PanelOption label="Свой размер" topLabel>
                <ButtonSize saveLocal />
            </PanelOption>
        </Panel>
    );
};
