import { FC } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';

import { gapModsCn, GapProps, SpacerProps, spacerModsCn } from '../spacers';

import './index.scss';

type RowAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
type RowJustify = 'start' | 'center' | 'end' | 'between' | 'around';
type RowType = 'inline';
type RowDirection = 'row' | 'col';
type RowWrap = 'nowrap' | 'wrap';

const cnRow = cn('Row');

interface IRowProps extends IClassNameProps, SpacerProps, GapProps {
  className?: string;
  align?: RowAlign;
  justify?: RowJustify;
  type?: RowType;
  direction?: RowDirection;
  grow?: boolean;
  wrap?: RowWrap;
}

export const Row: FC<
  React.PropsWithChildren<IRowProps & React.HTMLAttributes<HTMLElement>>
> = ({
  className,
  align,
  justify,
  type,
  direction,
  grow,
  wrap,
  children,
  ...props
}) => {
  if (!children) {
    return null;
  }

  const [spacerRest, spacerClassName] = spacerModsCn(props);
  const [rest, gapClassName] = gapModsCn(spacerRest);

  return (
    <div
      className={cnRow({ align, justify, type, direction, grow, wrap }, [
        className,
        spacerClassName,
        gapClassName,
      ])}
      {...rest}
    >
      {children}
    </div>
  );
};

export type RowProps = ExtractProps<typeof Row>;
