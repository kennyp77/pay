import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './warning.scss';

interface MessageBoxVariantWarningProps {
  variant?: 'warning';
}

export const withVariantWarning = withBemMod<
  MessageBoxVariantWarningProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'warning' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
