import React, { useMemo } from 'react';
import { withBemMod } from '@bem-react/core';

import { Text } from 'components/text';

import { cnSelect, ISelectProps, SelectVariantProps } from '../base';

import './outlined.scss';

interface SelectVariantOutlinedProps extends SelectVariantProps {
  variant?: 'outlined';
}

export const withVariantOutlined = withBemMod<
  SelectVariantOutlinedProps,
  ISelectProps
>(cnSelect(), { variant: 'outlined' }, (WrappedComponent) => {
  return ({ label, ...props }) => {
    const selectLabel = useMemo(() => {
      return (
        <Text as="label" color="secondary" className={cnSelect('Label')}>
          {label}
        </Text>
      );
    }, [label]);

    return <WrappedComponent addonBefore={selectLabel} {...props} />;
  };
});
