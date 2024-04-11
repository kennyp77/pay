import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnModal, ModalSizeProps, IModalProps } from '../base';

import './small.scss';

export const withSizeSmall = withBemMod<ModalSizeProps, IModalProps>(
  cnModal(),
  { size: 'small' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
