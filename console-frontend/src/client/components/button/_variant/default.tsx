import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './default.scss';

export const withVariantDefault = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'default' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
