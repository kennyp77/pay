import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnTextinput, InputVariantProps, ITextinputProps } from '../base';

import './outer-label.scss';

export const withVariantOuterLabel = withBemMod<
  InputVariantProps,
  ITextinputProps
>(cnTextinput(), { variant: 'outer-label' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
