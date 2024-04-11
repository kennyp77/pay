import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnLink, ILinkProps, LinkVariantProps } from '../base';

import './grey.scss';

export const withVariantGrey = withBemMod<LinkVariantProps, ILinkProps>(
  cnLink(),
  { variant: 'grey' },
  (WrappedComponent) => {
    return ({ ...props }) => {
      return <WrappedComponent {...props} />;
    };
  },
);
