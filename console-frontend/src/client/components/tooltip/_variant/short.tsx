import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnTooltip, TooltipProps } from '../base';

import './short.scss';

interface TextInputVariantShortProps {
  variant?: 'short';
}

export const withVariantShort = withBemMod<
  TextInputVariantShortProps,
  TooltipProps
>(cnTooltip(), { variant: 'short' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
