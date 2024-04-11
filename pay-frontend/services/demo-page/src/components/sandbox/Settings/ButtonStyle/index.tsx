import React, { useCallback, useContext } from 'react';

import { random } from '@trust/utils/string/random';
import { OptionSimple, Select } from '@yandex-lego/components/Select/desktop/bundle';
import { Text } from '@yandex-lego/components/Text/desktop/bundle';
import * as Sdk from '@yandex-pay/sdk/src/typings';
import { block } from 'bem-cn';

import { buttonContext, ButtonContext } from '../../../../store/button';
import { Highlighter } from '../../../common/Highlighter';

import { CustomParams } from './CustomParams';
import './index.css';

const b = block('button-style');

interface SandboxSelectProps {
    label: string;
    value: string;
    options: OptionSimple[];
    onChange: (value: string) => void;
}

function SandboxSelect({ label, options, value, onChange }: SandboxSelectProps): JSX.Element {
    return (
        <label className={b('select')} htmlFor={label}>
            <div className={b('select-label')}>
                <Text typography="headline-s" weight="regular">
                    {label}
                </Text>
            </div>
            <Select
                size="m"
                width="max"
                view="default"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
                    onChange(e.target.value)
                }
                value={value}
                options={options}
            />
        </label>
    );
}
const availableButtonTypes = [
    {
        value: Sdk.ButtonType.Pay,
        content: 'С надписью «Оплатить»',
    },
    {
        value: Sdk.ButtonType.Simple,
        content: 'Простой',
    },
    {
        value: Sdk.ButtonType.Checkout,
        content: 'Чекаут',
    },
];

const availableButtonThemes = [
    {
        value: Sdk.ButtonTheme.Black,
        content: 'Черная',
    },
    {
        value: Sdk.ButtonTheme.White,
        content: 'Белая',
    },
    {
        value: Sdk.ButtonTheme.WhiteOutlined,
        content: 'Белая c обводкой',
    },
];

const availableButtonWidthValues = [
    {
        value: Sdk.ButtonWidth.Max,
        content: 'Максимальная',
    },
    {
        value: Sdk.ButtonWidth.Auto,
        content: 'Автоматическая',
    },
];

const getStyleCode = (context: ButtonContext): string => {
    const { style, useCustomStyle, customStyle } = context;

    const script = `
<script>
  const button = YaPay.Button.create({
    type: Sdk.ButtonType.${style.type},
    theme: Sdk.ButtonTheme.${style.theme},
    width: Sdk.ButtonWidth.${style.width}
  });
</script>`;

    const styles = useCustomStyle
        ? `
<style>
  html .ya-pay-button {
    border-radius: ${customStyle?.['border-radius'] || 8}px;
    width: ${customStyle?.width || 223}px;
    height: ${customStyle?.height || 52}px;
  }
</style>`
        : '';

    return [script.trim(), styles.trim()].join('\n');
};

export function ButtonStyle(): JSX.Element {
    const context = useContext(buttonContext);
    const { style, useCustomStyle } = context;

    const code = getStyleCode(context);

    const updateButton = useCallback(() => {
        context.setButtonId(random(5));
    }, []);

    return (
        <div className={b()}>
            <div className={b('box')}>
                <SandboxSelect
                    label="Тип"
                    value={style.type}
                    onChange={(value): void => context.setStyle('type', value)}
                    options={availableButtonTypes}
                />
                <SandboxSelect
                    label="Тема"
                    value={style.theme}
                    onChange={(value): void => context.setStyle('theme', value)}
                    options={availableButtonThemes}
                />
                <SandboxSelect
                    label="Ширина"
                    value={style.width}
                    onChange={(value): void => context.setStyle('width', value)}
                    options={availableButtonWidthValues}
                />
            </div>

            <CustomParams />

            <button
                type="button"
                className={b('remount')}
                disabled={!useCustomStyle}
                onClick={updateButton}
            >
                Обновить кнопку
            </button>

            <Highlighter className={b('hl').toString()} lang="html" code={code} />
        </div>
    );
}
