import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './filled-grey.scss';

export const withVariantFilledGrey = withBemMod<
  ButtonVariantProps,
  IButtonProps
>(cnButton(), { variant: 'filled-grey' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
