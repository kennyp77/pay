import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './success.scss';

interface MessageBoxVariantSuccessProps {
  variant?: 'success';
}

export const withVariantSuccess = withBemMod<
  MessageBoxVariantSuccessProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'success' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
