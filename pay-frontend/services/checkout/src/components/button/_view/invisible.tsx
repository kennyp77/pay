import { withBemMod } from '@bem-react/core-fork';

import { IButtonProps, cnButton } from '../base';

import './invisible.scss';

interface ButtonVariantInvisibleProps {
    view?: 'invisible';
}

export const withViewInvisible = withBemMod<ButtonVariantInvisibleProps, IButtonProps>(cnButton(), {
    view: 'invisible',
});
