import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnTextinput, InputVariantProps, ITextinputProps } from '../base';

import './bordered.scss';

export const withVariantBordered = withBemMod<
  InputVariantProps,
  ITextinputProps
>(cnTextinput(), { variant: 'bordered' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
