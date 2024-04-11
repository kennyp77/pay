import React from 'react';

import { ButtonTheme, ButtonType, ButtonWidth } from '@yandex-pay/sdk/src/typings';

import { Panel } from 'components/panel';
import { PanelOption } from 'components/panel-option';
import { Select } from 'components/select';
import { useOption } from 'hooks/use-options';

import { ButtonSize } from '../../../components/button-size/button-size';

interface ButtonsProps {
    type?: boolean;
    theme?: boolean;
    width?: boolean;
    newButton?: boolean;
    customSize?: boolean;
}

export function Buttons(props: ButtonsProps) {
    return (
        <Panel caption="Кнопки">
            {props.type ? (
                <PanelOption label="Тип">
                    <ButtonTypeSelector />
                </PanelOption>
            ) : null}

            {props.theme ? (
                <PanelOption label="Тема">
                    <ButtonThemeSelector />
                </PanelOption>
            ) : null}

            {props.width ? (
                <PanelOption label="Ширина">
                    <ButtonWidthSelector />
                </PanelOption>
            ) : null}

            {props.newButton ? (
                <PanelOption label="Новая кнопка">
                    <ButtonNewSelector />
                </PanelOption>
            ) : null}

            {props.customSize ? (
                <PanelOption label="Свой размер" topLabel>
                    <ButtonSize />
                </PanelOption>
            ) : null}
        </Panel>
    );
}

function ButtonTypeSelector() {
    const [buttonType, setButtonType] = useOption(['buttonType']);

    return (
        <Select
            name="buttonType"
            value={buttonType}
            options={[
                { label: 'Simple', value: ButtonType.Simple },
                { label: 'Pay', value: ButtonType.Pay },
                { label: 'Checkout', value: ButtonType.Checkout },
            ]}
            onChange={setButtonType}
        />
    );
}

function ButtonThemeSelector() {
    const [buttonTheme, setButtonTheme] = useOption(['buttonTheme']);

    return (
        <Select
            name="buttonTheme"
            value={buttonTheme}
            options={[
                { label: 'Black', value: ButtonTheme.Black },
                { label: 'White', value: ButtonTheme.White },
                { label: 'WhiteOutlined', value: ButtonTheme.WhiteOutlined },
                { label: 'Yellow', value: ButtonTheme.Yellow },
            ]}
            onChange={setButtonTheme}
        />
    );
}

function ButtonWidthSelector() {
    const [buttonWidth, setButtonWidth] = useOption(['buttonWidth']);

    return (
        <Select
            name="buttonWidth"
            value={buttonWidth}
            options={[
                { label: 'Auto', value: ButtonWidth.Auto },
                { label: 'Max', value: ButtonWidth.Max },
            ]}
            onChange={setButtonWidth}
        />
    );
}

function ButtonNewSelector() {
    const [value, setValue] = useOption(['buttonNew']);

    return (
        <Select
            name="buttonNew"
            value={value}
            options={[
                { label: '---', value: '' },
                { label: 'Новая', value: 'new-button' },
                { label: 'Показать пустые данные', value: 'new-button--show-empty' },
                { label: 'С текстовым лого', value: 'new-button--logo-as-text' },
            ]}
            onChange={setValue}
        />
    );
}
