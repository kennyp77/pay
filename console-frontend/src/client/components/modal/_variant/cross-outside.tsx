import React from 'react';
import { withBemMod } from '@bem-react/core';
import { Icon } from 'components/icon';

import { cnModal, IModalProps, ModalVariantProps } from '../base';

import { Block } from 'components/block';

import './cross-outside.scss';

export const withVariantCrossOutside = withBemMod<
  ModalVariantProps,
  IModalProps
>(cnModal(), { variant: 'cross-outside' }, (WrappedComponent) => {
  return ({ variant, additionalBlock, ...props }) => {
    return (
      <WrappedComponent {...props} {...variant}>
        <button
          className={cnModal('close-button')}
          onClick={
            props.onClose as unknown as React.MouseEventHandler<HTMLButtonElement>
          }
        >
          <Icon glyph="type-cross" />
        </button>
        <Block shadow radius={24} bg="white">
          {props.children}
        </Block>
        {additionalBlock ? (
          <Block shadow radius={16} bg="white" top={12}>
            {additionalBlock()}
          </Block>
        ) : null}
      </WrappedComponent>
    );
  };
});
