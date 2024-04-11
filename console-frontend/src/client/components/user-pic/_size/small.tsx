import React from 'react';
import { withBemMod } from '@bem-react/core';

import { cnUserPic, IUserPicProps } from '../base';

import './small.scss';

interface IUserPicPropsVariantSmallProps {
  size?: 's';
}

export const withSizeS = withBemMod<
  IUserPicPropsVariantSmallProps,
  IUserPicProps
>(cnUserPic(), { size: 's' }, (WrappedComponent) => {
  return ({ ...props }) => {
    return <WrappedComponent {...props} />;
  };
});
