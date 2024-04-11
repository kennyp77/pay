import React, { FC } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';

import { SpacerProps, spacerModsCn } from '../spacers';

import './index.scss';

type BoxAlign = 'start' | 'center' | 'end';
type BoxType = 'inline' | 'flex';

const cnBox = cn('Box');

interface IBoxProps extends IClassNameProps, SpacerProps {
  className?: string;
  align?: BoxAlign;
  type?: BoxType;
  as?: React.ElementType;
}

export const Box: FC<
  React.PropsWithChildren<IBoxProps & React.HTMLAttributes<HTMLElement>>
> = ({
  className,
  align,
  type,
  children,
  as: ElementType = 'div',
  ...props
}) => {
  if (!children) {
    return null;
  }

  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <ElementType
      className={cnBox({ align, type }, [className, spacerClassName])}
      {...rest}
    >
      {children}
    </ElementType>
  );
};

export type BoxProps = ExtractProps<typeof Box>;
