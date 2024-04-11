import { compose, composeU, ExtractProps } from '@bem-react/core';

import { Modal as ModalDesktop } from '@yandex/ui/Modal/desktop/bundle';

import { withZIndex } from '@yandex/ui/withZIndex';

import { withVariantDefault } from './_variant/default';
import { withVariantCrossOutside } from './_variant/cross-outside';
import { withVariantNoCross } from './_variant/no-cross';
import { withSizeSmall } from './_size/small';

export const Modal = compose(
  withZIndex,
  composeU(withVariantDefault, withVariantCrossOutside, withVariantNoCross),
  withSizeSmall,
)(ModalDesktop);

export type PopupProps = ExtractProps<typeof Modal>;
