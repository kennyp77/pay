import { compose, composeU, ExtractProps } from '@bem-react/core';

import {
  Textinput as TextinputDesktop,
  withSizeM,
  withSizeS,
  withViewMaterial,
  withViewDefault,
} from '@yandex/ui/Textinput/desktop';

import { withVariantBordered } from './_variant/bordered';
import { withVariantOutlined } from './_variant/outlined';
import { withVariantOuterLabel } from './_variant/outer-label';

export type { InputVariantProps } from './base';

export const Textinput = compose(
  composeU(withSizeS, withSizeM),
  composeU(withViewDefault, withViewMaterial),
  composeU(withVariantBordered, withVariantOutlined, withVariantOuterLabel),
)(TextinputDesktop);

export type TextinputProps = ExtractProps<typeof Textinput>;
