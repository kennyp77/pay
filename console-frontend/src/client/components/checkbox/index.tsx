import { compose, composeU, ExtractProps } from '@bem-react/core';

import {
  Checkbox as CheckboxDesktop,
  withSizeM,
  withSizeS,
  withViewDefault,
} from '@yandex/ui/Checkbox/desktop';

import { withVariantGrayLabel } from './_variant/gray-label';

export const Checkbox = compose(
  composeU(withSizeS, withSizeM),
  withVariantGrayLabel,
  withViewDefault,
)(CheckboxDesktop);

export type TextinputProps = ExtractProps<typeof Checkbox>;
