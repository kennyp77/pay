import { compose, ExtractProps } from '@bem-react/core';
import {
    Popup as PopupDesktop,
    withViewDefault,
    withTargetAnchor,
    withNonvisual,
    Direction,
} from '@yandex-lego/components/Popup/desktop';

import { withThemeDark } from './_theme/_dark/Popup_theme_dark';

export const Popup = compose(
    withViewDefault,
    withTargetAnchor,
    withThemeDark,
    withNonvisual,
)(PopupDesktop);

export type PopupProps = ExtractProps<typeof Popup>;
export type PopupDirection = Direction;
