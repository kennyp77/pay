import React, { FC } from 'react';

import { Menu, MenuProps } from 'components/menu';

export type BillDropdownOptionsProps = {
  options: MenuProps['items'];
};

export const BillDropdownOptions: FC<BillDropdownOptionsProps> = ({
  options,
}) => {
  return <Menu items={options} size="m" variant="dropdown" view="default" />;
};
