import React, { FC, useCallback, useMemo } from 'react';
import { cn } from '@bem-react/classname';

import { ButtonDefault } from '../button-default';
import { Dropdown } from 'components/dropdown';
import { Icon } from 'components/icon';
import { useToggle } from 'react-use';

import {
  BillDropdownOptions,
  BillDropdownOptionsProps,
} from './bill-dropdown-options';

import './index.scss';

type BillDropdownProps = {
  buttonText?: string;
  options: BillDropdownOptionsProps['options'];
  notCheckOptions?: boolean;
  iconUrl?: string;
  hasDropdownIcon?: boolean;
  onSelect?: (values: string[]) => void;
  onBlur?: (values: string[]) => void;
};

const cnBillDropdown = cn('BillDropdown');

export const BillDropdown: FC<BillDropdownProps> = ({
  buttonText,
  options,
  iconUrl,
  hasDropdownIcon,
}) => {
  const [dropdownVisible, toggleDropdownVisible] = useToggle(false);

  const DropdownIcon = useCallback(
    (className) => {
      return (
        <Icon
          className={cnBillDropdown(
            'Icon',
            {
              top: dropdownVisible,
            },
            [className],
          )}
          url="/icons/arrow-down-black.svg"
          size={36}
        />
      );
    },
    [dropdownVisible],
  );

  const IconFromProps = useCallback(
    (className) => {
      return <Icon className={className} size={36} url={iconUrl} />;
    },
    [iconUrl],
  );

  const DropdownContent = useMemo(() => {
    return <BillDropdownOptions options={options} />;
  }, [options]);

  return (
    <Dropdown
      className={cnBillDropdown()}
      trigger="click"
      content={DropdownContent}
      view="default"
      direction="bottom-end"
      onVisibleChange={(visible: boolean) => toggleDropdownVisible(visible)}
    >
      <ButtonDefault iconRight={hasDropdownIcon ? DropdownIcon : IconFromProps}>
        {buttonText}
      </ButtonDefault>
    </Dropdown>
  );
};
