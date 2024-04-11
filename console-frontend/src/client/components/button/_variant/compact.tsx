import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './compact.scss';

export const withVariantCompact = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'compact' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
