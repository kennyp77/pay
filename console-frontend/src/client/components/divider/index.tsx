import { compose, ExtractProps } from '@bem-react/core';

import { Divider as DividerDesktop } from '@yandex/ui/Divider/desktop';

import './index.scss';

export const Divider = compose()(DividerDesktop);

export type DividerProps = ExtractProps<typeof Divider>;
