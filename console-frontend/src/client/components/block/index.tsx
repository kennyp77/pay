import React, { FC } from 'react';
import { compose, ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';

import { SpacerProps, spacerModsCn } from '../spacers';

import './index.scss';

type BlockRadius = '32' | '24' | '20' | '16';

type BlockBackground = 'white' | 'grey';

type BlockShadow = boolean;

type BlockPadding = '32' | '24' | '16';

export const cnBlock = cn('Block');

export interface IBlockProps extends IClassNameProps, SpacerProps {
  className?: string;
  as?: React.ElementType;
  bg?: BlockBackground;
  radius?: BlockRadius;
  shadow?: BlockShadow;
  padding?: BlockPadding;
}

const BlockPresenter: FC<
  React.PropsWithChildren<IBlockProps & React.HTMLAttributes<HTMLElement>>
> = ({
  className,
  as: ElementType = 'div',
  bg,
  radius,
  shadow,
  padding,
  children,
  ...props
}) => {
  if (!children) {
    return null;
  }

  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <ElementType
      className={cnBlock({ bg, radius, shadow, padding }, [
        className,
        spacerClassName,
      ])}
      {...rest}
    >
      {children}
    </ElementType>
  );
};

export const Block = compose()(BlockPresenter);

export type BlockProps = ExtractProps<typeof Block>;
