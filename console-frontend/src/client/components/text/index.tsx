import React, { FC } from 'react';
import { cn } from '@bem-react/classname';

import { SpacerProps, spacerModsCn } from '../spacers';

import './index.scss';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'error';
type TextAlign = 'left' | 'center' | 'right';
type TextVariant = 'label' | 'header_s' | 'header_m' | 'header_l' | 'header_xl';
type TextSize = 12 | 14;
type TextWeight = 400 | 500 | 700;
type TextOverflow = 'ellipsis';
type TextTransform = 'uppercase';

export interface TextProps extends SpacerProps {
  className?: string;
  as?: React.ElementType;
  variant?: TextVariant;
  size?: TextSize;
  color?: TextColor;
  align?: TextAlign;
  weight?: TextWeight;
  overflow?: TextOverflow;
  isContent?: boolean;
  transform?: TextTransform;
}

const cnText = cn('Text');

export const Text: FC<
  React.PropsWithChildren<TextProps & React.HTMLAttributes<HTMLElement>>
> = ({
  className,
  variant,
  color = 'main',
  align = 'left',
  size,
  weight,
  overflow,
  transform,
  as: ElementType = 'span',
  isContent = false,
  children,
  ...props
}) => {
  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <ElementType
      className={cnText(
        {
          variant,
          color,
          align,
          weight,
          size,
          overflow,
          transform,
          is_content: isContent,
        },
        [className, spacerClassName],
      )}
      {...rest}
    >
      {children}
    </ElementType>
  );
};
