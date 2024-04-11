import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnModal, IModalProps, ModalVariantProps } from '../base';

import { Block } from 'components/block';

import './no-cross.scss';

export const withVariantNoCross = withBemMod<ModalVariantProps, IModalProps>(
  cnModal(),
  { variant: 'no-cross' },
  (WrappedComponent) => {
    return ({ variant, ...props }) => {
      return (
        <WrappedComponent {...props} {...variant}>
          <Block shadow radius={24} bg="white">
            {props.children}
          </Block>
        </WrappedComponent>
      );
    };
  },
);
