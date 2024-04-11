import React, { FC } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';

import { SpacerProps, spacerModsCn } from '../spacers';

import './index.scss';

type FlexDirection = 'column' | 'row';

const cnFlex = cn('Flex');

interface IFlexProps extends IClassNameProps, SpacerProps {
  className?: string;
  direction?: FlexDirection;
}

export const Flex: FC<
  React.PropsWithChildren<IFlexProps & React.HTMLAttributes<HTMLElement>>
> = ({ className, direction, children, ...props }) => {
  if (!children) {
    return null;
  }

  const [rest, spacerClassName] = spacerModsCn(props);

  return (
    <div
      className={cnFlex({ direction }, [className, spacerClassName])}
      {...rest}
    >
      {children}
    </div>
  );
};

export type FlexProps = ExtractProps<typeof Flex>;
