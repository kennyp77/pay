import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './freeze.scss';

interface MessageBoxVariantFreezeProps {
  variant?: 'freeze';
}

export const withVariantFreeze = withBemMod<
  MessageBoxVariantFreezeProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'freeze' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
