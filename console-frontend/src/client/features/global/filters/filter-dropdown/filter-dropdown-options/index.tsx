import React, { ChangeEvent, FC, useCallback, useState } from 'react';

import { Menu, MenuProps } from 'components/menu';

export type FilterDropdownOptionsProps = {
  options: MenuProps['items'];
  defaultValues?: MenuProps['value'];
  notCheckOptions?: boolean;
  onSelect: (values: string[]) => void;
};

export const FilterDropdownOptions: FC<FilterDropdownOptionsProps> = ({
  options,
  defaultValues,
  notCheckOptions,
  onSelect,
}) => {
  const [checkedValues, setCheckedValues] = useState<string[]>(
    defaultValues || [],
  );

  const handleSelect = useCallback(
    (e: ChangeEvent<HTMLElement>) => {
      const value = (e.target as HTMLInputElement).value as unknown as string[];
      setCheckedValues(value);

      if (onSelect) {
        onSelect(value);
      }
    },
    [onSelect],
  );

  return (
    <Menu
      value={!notCheckOptions ? checkedValues : null}
      items={options}
      onChange={handleSelect}
      size="m"
      variant="dropdown"
      view="default"
    />
  );
};
