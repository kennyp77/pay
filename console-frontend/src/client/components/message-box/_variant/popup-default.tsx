import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMessageBox, MessageBoxProps } from '../base';

import './popup-default.scss';

interface MessageBoxVariantPopupDefaultProps {
  variant?: 'popup-default';
}

export const withVariantPopupDefault = withBemMod<
  MessageBoxVariantPopupDefaultProps,
  MessageBoxProps
>(cnMessageBox(), { variant: 'popup-default' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
