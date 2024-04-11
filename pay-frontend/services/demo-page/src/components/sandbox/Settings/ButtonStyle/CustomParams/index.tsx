import React, { useCallback, useContext } from 'react';

import { Checkbox } from '@yandex-lego/components/Checkbox/desktop/bundle';
import { block } from 'bem-cn';

import { buttonContext, InitialContext } from '../../../../../store/button';
import { Slider } from '../../../../common/Slider';

const b = block('button-style');

export function CustomParams(): JSX.Element {
    const context = useContext(buttonContext);
    const { customStyle, useCustomStyle } = context;

    const widthChange = useCallback(
        (width: number) => {
            context.setCustomStyle('width', width);
        },
        [context],
    );

    const heightChange = useCallback(
        (height: number) => {
            context.setCustomStyle('height', height);
        },
        [context],
    );

    const radiusChange = useCallback(
        (borderRadius: number) => {
            context.setCustomStyle('border-radius', borderRadius);
        },
        [context],
    );

    return (
        <div className={b('custom-styles')}>
            <Checkbox
                label="Собственные стили"
                size="m"
                view="default"
                onChange={(): void => context.toggleCustom()}
                checked={useCustomStyle}
            />
            {useCustomStyle && (
                <div className={b('content')}>
                    <Slider label="Ширина" value={customStyle.width} max={400} onChange={widthChange} />
                    <Slider label="Высота" value={customStyle.height} min={40} max={90} onChange={heightChange} />
                    <Slider label="Скругление" value={customStyle['border-radius']} max={50} onChange={radiusChange} />
                </div>
            )}
        </div>
    );
}
