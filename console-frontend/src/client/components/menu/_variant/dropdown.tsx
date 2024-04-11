import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnMenu, IMenuProps, MenuVariantProps } from '../base';

import './dropdown.scss';

export const withVariantDropdown = withBemMod<MenuVariantProps, IMenuProps>(
  cnMenu(),
  { variant: 'dropdown' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
