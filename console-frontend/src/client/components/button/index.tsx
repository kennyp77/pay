import { compose, composeU, ExtractProps } from '@bem-react/core';

import {
  Button as ButtonDesktop,
  withSizeM,
  withSizeS,
  withSizeL,
  withViewClear,
  withViewDefault,
  withViewAction,
  withViewRaised,
  withViewPseudo,
  withWidthMax,
  withWidthAuto,
  withTypeSubmit,
  withTypeLink,
} from '@yandex/ui/Button/desktop';

import { withVariantRed } from './_variant/red';
import { withVariantCleared } from './_variant/cleared';
import { withVariantAsText } from './_variant/as-text';
import { withVariantAsLink } from './_variant/as-link';
import { withVariantCompact } from './_variant/compact';
import { withVariantOutlined } from './_variant/outlined';
import { withVariantDefault } from './_variant/default';
import { withVariantMessageBoxWhite } from './_variant/message-box-white';
import { withVariantFilledGrey } from './_variant/filled-grey';
import { withVariantPure } from './_variant/pure';
import { withVariantClearedWithEffects } from './_variant/cleared-with-effects';
import { withVariantClearedWithBorderEffects } from './_variant/cleared-with-border-effects';

export const Button = compose(
  composeU(withSizeS, withSizeM, withSizeL),
  composeU(
    withViewClear,
    withViewDefault,
    withViewAction,
    withViewRaised,
    withViewPseudo,
  ),
  composeU(
    withVariantOutlined,
    withVariantRed,
    withVariantCleared,
    withVariantAsText,
    withVariantAsLink,
    withVariantCompact,
    withVariantDefault,
    withVariantMessageBoxWhite,
    withVariantFilledGrey,
    withVariantPure,
    withVariantClearedWithEffects,
    withVariantClearedWithBorderEffects,
  ),
  composeU(withWidthMax, withWidthAuto),
  composeU(withTypeSubmit, withTypeLink),
)(ButtonDesktop);

export type ButtonProps = ExtractProps<typeof Button>;
