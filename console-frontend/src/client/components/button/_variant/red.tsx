import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './red.scss';

export const withVariantRed = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'red' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
