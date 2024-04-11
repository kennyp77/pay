import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './cleared-with-border-effects.scss';

export const withVariantClearedWithBorderEffects = withBemMod<
  ButtonVariantProps,
  IButtonProps
>(
  cnButton(),
  { variant: 'cleared-with-border-effects' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
