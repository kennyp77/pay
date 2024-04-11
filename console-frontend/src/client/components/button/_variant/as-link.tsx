import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './as-link.scss';

export const withVariantAsLink = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'as-link' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
