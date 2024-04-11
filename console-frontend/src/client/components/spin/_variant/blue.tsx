import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnSpin, ISpinProps, SpinVariantProps } from '../base';

import './blue.scss';

export const withVariantBlue = withBemMod<SpinVariantProps, ISpinProps>(
  cnSpin(),
  { variant: 'blue' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
