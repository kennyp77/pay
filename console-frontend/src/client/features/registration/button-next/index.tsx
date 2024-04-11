import { FC } from 'react';
import { cn } from '@bem-react/classname';

import { Icon } from 'components/icon';

import { Button, ButtonProps } from 'components/button';

import { basePath } from 'const';
import './index.scss';

interface IButtonNextProps extends ButtonProps {
  withIconNext?: boolean;
  progressText?: string;
}

const cnButtonNext = cn('ButtonNext');

export const ButtonNext: FC<IButtonNextProps> = ({
  withIconNext,
  disabled,
  progress,
  onClick,
  type = 'submit',
  progressText = 'Ожидание...',
  ...props
}) => {
  return (
    <Button
      className={cnButtonNext()}
      variant="red"
      view="action"
      width="max"
      type={type}
      onClick={onClick}
      disabled={disabled}
      progress={progress}
      {...props}
    >
      {!progress ? (
        <>
          {props.children}
          {withIconNext ? (
            <Icon
              className={cnButtonNext('Icon')}
              size={24}
              url={`${basePath}/arrow-long-right.svg`}
            />
          ) : null}
        </>
      ) : (
        <>{progressText}</>
      )}
    </Button>
  );
};
