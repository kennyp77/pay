import React, { FC } from 'react';
import { ExtractProps } from '@bem-react/core';

import { Row, RowProps } from '../row';

interface IColProps extends Omit<RowProps, 'align' | 'justify'> {
  justify?: RowProps['align'];
  align?: RowProps['justify'];
}

export const Col: FC<
  React.PropsWithChildren<IColProps & React.HTMLAttributes<HTMLElement>>
> = ({ justify, align, children, ...props }) => {
  if (!children) {
    return null;
  }

  return (
    <Row align={justify} justify={align} direction="col" {...props}>
      {children}
    </Row>
  );
};

export type ColProps = ExtractProps<typeof Col>;
