import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './error.scss';

interface MessageBoxVariantErrorProps {
  variant?: 'error';
}

export const withVariantError = withBemMod<
  MessageBoxVariantErrorProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'error' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
