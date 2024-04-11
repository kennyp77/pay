import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './message-box-white.scss';

export const withVariantMessageBoxWhite = withBemMod<
  ButtonVariantProps,
  IButtonProps
>(cnButton(), { variant: 'message-box-white' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
