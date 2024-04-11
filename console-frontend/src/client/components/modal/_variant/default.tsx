import React from 'react';
import { withBemMod } from '@bem-react/core';
import { Icon } from 'components/icon';

import { cnModal, IModalProps, ModalVariantProps } from '../base';

import { Block } from 'components/block';
import { Button } from 'components/button';

import './default.scss';

export const withVariantDefault = withBemMod<ModalVariantProps, IModalProps>(
  cnModal(),
  { variant: 'default' },
  (WrappedComponent) => {
    return ({ variant, contentPadding = 24, ...props }) => {
      return (
        <WrappedComponent {...props} {...variant}>
          <Button
            variant="cleared-with-effects"
            className={cnModal('close-button')}
            onClick={
              props.onClose as unknown as React.MouseEventHandler<HTMLButtonElement>
            }
          >
            <Icon glyph="type-cross" style={{ color: 'var(--color-icon)' }} />
          </Button>
          <Block shadow padding={contentPadding} radius={24} bg="white">
            {props.children}
          </Block>
        </WrappedComponent>
      );
    };
  },
);
