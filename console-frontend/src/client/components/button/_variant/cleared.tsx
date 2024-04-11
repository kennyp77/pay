import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './cleared.scss';

export const withVariantCleared = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'cleared' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
