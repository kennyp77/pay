import React, { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button, ButtonProps } from 'components/button';

import './index.scss';

interface IButtonDefaultProps extends ButtonProps {
  onClick?: () => void;
}

const cnButtonDefault = cn('ButtonDefault');

export const ButtonDefault: FC<IButtonDefaultProps> = ({
  onClick,
  children,
  ...props
}) => {
  return (
    <Button
      className={cnButtonDefault()}
      size="m"
      view="pseudo"
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};
