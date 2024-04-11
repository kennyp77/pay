import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnButton, IButtonProps, ButtonVariantProps } from '../base';

import './outlined.scss';

export const withVariantOutlined = withBemMod<ButtonVariantProps, IButtonProps>(
  cnButton(),
  { variant: 'outlined' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
