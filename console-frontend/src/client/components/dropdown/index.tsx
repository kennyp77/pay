import { compose, ExtractProps } from '@bem-react/core';

import { Dropdown as DropdownDesktop } from '@yandex/ui/Dropdown/desktop';

import './index.scss';

export const Dropdown = compose()(DropdownDesktop);

export type DropdownProps = ExtractProps<typeof Dropdown>;
