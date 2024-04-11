import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './finish.scss';

interface MessageBoxVariantFinishProps {
  variant?: 'finish';
}

export const withVariantFinish = withBemMod<
  MessageBoxVariantFinishProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'finish' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
