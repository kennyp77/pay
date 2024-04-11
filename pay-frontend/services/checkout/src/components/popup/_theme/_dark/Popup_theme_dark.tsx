import { withBemMod } from '@bem-react/core';
import { cnPopup } from '@yandex-lego/components/Popup';

import './Popup_theme_dark.scss';

export interface IPopupThemeDarkProps {
    theme?: 'dark';
}

export const withThemeDark = withBemMod<IPopupThemeDarkProps>(cnPopup(), {
    theme: 'dark',
});
