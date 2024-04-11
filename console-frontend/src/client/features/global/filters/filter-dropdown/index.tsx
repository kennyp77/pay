import React, { FC, useCallback, useState, useMemo } from 'react';
import { cn } from '@bem-react/classname';

import { ButtonDefault } from '../button-default';
import { Dropdown } from 'components/dropdown';
import { Icon } from 'components/icon';
import { useToggle } from 'react-use';

import {
  FilterDropdownOptions,
  FilterDropdownOptionsProps,
} from './filter-dropdown-options';

import { basePath } from 'const';
import './index.scss';

type FilterDropdownProps = {
  buttonText?: string;
  options: FilterDropdownOptionsProps['options'];
  notCheckOptions?: boolean;
  iconUrl?: string;
  hasDropdownIcon?: boolean;
  onSelect?: (values: string[]) => void;
  onBlur?: (values: string[]) => void;
  defaultValues?: FilterDropdownOptionsProps['defaultValues'];
};

const cnFilterDropdown = cn('FilterDropdown');

export const FilterDropdown: FC<FilterDropdownProps> = ({
  buttonText,
  options,
  notCheckOptions,
  iconUrl,
  hasDropdownIcon,
  onSelect,
  onBlur,
  defaultValues,
}) => {
  const [dropdownVisible, toggleDropdownVisible] = useToggle(false);
  const [activeValues, setActiveValues] = useState<string[]>([]);

  const DropdownIcon = useCallback(
    (className: string) => {
      return (
        <Icon
          className={`${cnFilterDropdown('Icon', {
            top: dropdownVisible,
          })} ${className}`}
          url={`${basePath}/icons/arrow-down-black.svg`}
          size={36}
        />
      );
    },
    [dropdownVisible],
  );

  const IconFromProps = useCallback(
    (className: string) => {
      return <Icon className={className} size={36} url={iconUrl} />;
    },
    [iconUrl],
  );

  const handleSelect = useCallback(
    (values: string[]) => {
      setActiveValues(values);

      if (onSelect) {
        onSelect(values);
      }
    },
    [onSelect],
  );

  const handleVisibleChange = useCallback(
    (visible: boolean) => {
      toggleDropdownVisible(visible);
      if (!visible && onBlur) {
        onBlur(activeValues);
      }
    },
    [toggleDropdownVisible, onBlur, activeValues],
  );

  const DropdownContent = useMemo(() => {
    return (
      <FilterDropdownOptions
        options={options}
        notCheckOptions={notCheckOptions}
        onSelect={(values) => handleSelect(values)}
        defaultValues={defaultValues}
      />
    );
  }, [handleSelect, notCheckOptions, options, defaultValues]);

  return (
    <Dropdown
      className={cnFilterDropdown()}
      trigger="click"
      content={DropdownContent}
      view="default"
      onVisibleChange={(visible: boolean) => handleVisibleChange(visible)}
    >
      <ButtonDefault iconRight={hasDropdownIcon ? DropdownIcon : IconFromProps}>
        {buttonText}
      </ButtonDefault>
    </Dropdown>
  );
};
