import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnTextinput, InputVariantProps, ITextinputProps } from '../base';

import './outlined.scss';

export const withVariantOutlined = withBemMod<
  InputVariantProps,
  ITextinputProps
>(cnTextinput(), { variant: 'outlined' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
