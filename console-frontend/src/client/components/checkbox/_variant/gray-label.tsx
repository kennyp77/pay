import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnCheckbox, ICheckboxProps } from '../base';

import './gray-label.css';

interface CheckboxVariantGrayLabelProps {
  variant?: 'gray-label';
}

export const withVariantGrayLabel = withBemMod<
  CheckboxVariantGrayLabelProps,
  ICheckboxProps
>(cnCheckbox(), { variant: 'gray-label' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
