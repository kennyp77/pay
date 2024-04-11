import { compose, composeU, ExtractProps } from '@bem-react/core';

import {
  Menu as MenuDesktop,
  withSizeM,
  withViewDefault,
  withWidthMax,
} from '@yandex/ui/Menu/desktop';

import { withVariantCleared } from './_variant/cleared';
import { withVariantDropdown } from './_variant/dropdown';

export const Menu = compose(
  withSizeM,
  withViewDefault,
  withWidthMax,
  composeU(withVariantCleared, withVariantDropdown),
)(MenuDesktop);

export type MenuProps = ExtractProps<typeof Menu>;
