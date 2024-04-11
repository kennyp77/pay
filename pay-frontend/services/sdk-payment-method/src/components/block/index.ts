import { block } from 'bem-cn';

import { listenScaleChanges } from '../../helpers/scaler';

import './styles.css';

interface BlockProps {
    id: string;
    minWidth: number;
    maxWidth?: number | string;
    minHeight: number;
    maxHeight?: number | string;
}

const b = block('block');

export default function Block(
    { id, minWidth, maxWidth = '100%', minHeight, maxHeight = '100%' }: BlockProps,
    children: string,
): string {
    const maxWidthUnits = typeof maxWidth === 'number' ? 'px' : '';
    const maxHeightUnits = typeof maxHeight === 'number' ? 'px' : '';
    const style = [
        `min-width: ${minWidth}px;`,
        `min-height: ${minHeight}px;`,
        `max-width: ${maxWidth}${maxWidthUnits};`,
        `max-height: ${maxHeight}${maxHeightUnits};`,
    ].join('');

    listenScaleChanges(id, minWidth, minHeight, function onResize(scale) {
        const element = document.getElementById(id);

        if (element && scale > 0) {
            element.style.setProperty(
                'transform',
                `translate(0, -50%) scale(${scale.toFixed(4)}) `,
            );
        }
    });

    return `
    <div class="${b()}" style="${style}" id="${id}">
      ${children}
    </div>
  `;
}
