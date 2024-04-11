import { FC } from 'react';
import { compose, composeU } from '@bem-react/core';
import {
  Icon as IconDesktop,
  withGlyphTypeCheck,
  withGlyphTypeCross,
} from '@yandex/ui/Icon/desktop';
import { cnIcon, IIconProps, CustomIconProps } from './base';

import './index.scss';

export interface IconProps extends Omit<IIconProps, 'size'> {
  glyph?: CustomIconProps['glyph'];
  size?: 12 | 16 | 20 | 24 | 36 | 40 | 52 | 56;
  height?: IconProps['size'];
}

export const IconPresenter = compose(
  composeU(withGlyphTypeCheck, withGlyphTypeCross),
)(IconDesktop);

export const Icon: FC<IconProps> = ({
  url,
  style,
  direction,
  title,
  glyph,
  className,
  children,
  size = 16,
  height = size,
}) => {
  return (
    <IconPresenter
      className={cnIcon({}, [className])}
      url={url}
      glyph={glyph}
      direction={direction}
      title={title}
      style={{
        ...style,
        width: `var(--size-${size})`,
        height: `var(--size-${height})`,
      }}
    >
      {children}
    </IconPresenter>
  );
};
