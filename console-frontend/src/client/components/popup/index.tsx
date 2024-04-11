import { compose, ExtractProps } from '@bem-react/core';

import {
  Popup as PopupDesktop,
  withViewDefault,
  withTargetAnchor,
  withNonvisual,
} from '@yandex/ui/Popup/desktop/';

export const Popup = compose(
  withViewDefault,
  withTargetAnchor,
  withNonvisual,
)(PopupDesktop);

export type PopupProps = ExtractProps<typeof Popup>;
