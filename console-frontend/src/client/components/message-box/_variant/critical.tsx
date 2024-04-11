import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './critical.scss';

interface MessageBoxVariantCriticalProps {
  variant?: 'critical';
}

export const withVariantCritical = withBemMod<
  MessageBoxVariantCriticalProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'critical' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
