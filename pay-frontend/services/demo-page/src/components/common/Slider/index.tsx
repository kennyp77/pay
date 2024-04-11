import React from 'react';

import { Slider as LegoSlider } from '@yandex-lego/components/Slider/desktop/bundle';
import { Text } from '@yandex-lego/components/Text/desktop/bundle';
import { block } from 'bem-cn';

import './index.css';

interface SliderProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    onChange: (v: number) => void;
}

const b = block('slider');

export function Slider({ label, value, max, min, onChange }: SliderProps): JSX.Element {
    return (
        <label className={b('param')} htmlFor={label}>
            <div className={b('param-label')}>
                <Text typography="headline-s" weight="regular">
                    {`${label} ${value}px`}
                </Text>
            </div>
            <LegoSlider
                view="default"
                filled
                value={[value]}
                min={min ?? 0}
                max={max ?? 100}
                onInput={(event, nextValue): void => onChange(nextValue[0])}
            />
        </label>
    );
}
