import React from 'react';

import { compose } from '@bem-react/core';
import {
    Popup as PopupDesktop,
    withViewDefault,
    withTargetAnchor,
    withNonvisual,
    Direction,
} from '@yandex-lego/components/Popup/desktop';

export const Popup = compose(withViewDefault, withTargetAnchor, withNonvisual)(PopupDesktop);

export type PopupProps = React.ComponentProps<typeof Popup>;
export type PopupDirection = Direction;
