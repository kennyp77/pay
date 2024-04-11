import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMenu, IMenuProps, MenuVariantProps } from '../base';

export const withVariantCleared = withBemMod<MenuVariantProps, IMenuProps>(
  cnMenu(),
  { variant: 'cleared' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
