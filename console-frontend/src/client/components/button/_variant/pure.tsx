import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './pure.scss';

export const withVariantPure = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'pure' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
