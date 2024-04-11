import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './check.scss';

interface MessageBoxVariantCheckProps {
  variant?: 'check';
}

export const withVariantCheck = withBemMod<
  MessageBoxVariantCheckProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'check' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
