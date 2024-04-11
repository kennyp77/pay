import { compose, ExtractProps } from '@bem-react/core';

import {
  Tooltip as TooltipDesktop,
  withSizeM,
  withViewDefault,
} from '@yandex/ui/Tooltip/desktop';

import { withVariantShort } from './_variant/short';

export const Tooltip = compose(
  withSizeM,
  withViewDefault,
  withVariantShort,
)(TooltipDesktop);

export type TooltipProps = ExtractProps<typeof Tooltip>;
