import { compose, composeU, ExtractProps } from '@bem-react/core';

import {
  MessageBox as MessageBoxDesktop,
  withSizeS,
  withViewDefault,
} from '@yandex/ui/MessageBox/desktop';

import { withVariantSuccess } from './_variant/success';
import { withVariantWarning } from './_variant/warning';
import { withVariantError } from './_variant/error';
import { withVariantFreeze } from './_variant/freeze';
import { withVariantCritical } from './_variant/critical';
import { withVariantCheck } from './_variant/check';
import { withVariantFinish } from './_variant/finish';
import { withVariantPopupDefault } from './_variant/popup-default';

import './index.scss';

export const MessageBox = compose(
  withSizeS,
  withViewDefault,
  composeU(
    withVariantSuccess,
    withVariantWarning,
    withVariantError,
    withVariantFreeze,
    withVariantCritical,
    withVariantCheck,
    withVariantFinish,
    withVariantPopupDefault,
  ),
)(MessageBoxDesktop);

export type MessageBoxProps = ExtractProps<typeof MessageBox>;
