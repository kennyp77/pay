import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './as-text.scss';

export const withVariantAsText = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'as-text' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
