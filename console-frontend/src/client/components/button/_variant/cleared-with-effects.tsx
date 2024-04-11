import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './cleared-with-effects.scss';

export const withVariantClearedWithEffects = withBemMod<
  ButtonVariantProps,
  IButtonProps
>(cnButton(), { variant: 'cleared-with-effects' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
