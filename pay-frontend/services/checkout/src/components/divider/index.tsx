import { compose, ExtractProps } from '@bem-react/core';
import { Divider as DividerBase } from '@yandex-lego/components/Divider/desktop';

import { withColor } from './_mix/color';

export const Divider = compose(withColor)(DividerBase);

export type DividerProps = ExtractProps<typeof Divider>;
